# AWS本番環境デプロイガイド

このガイドでは、BASHOTORIアプリケーションをAWS上で本格実装・運用するための手順を説明します。

## 📋 目次

1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [AWSリソースの準備](#2-awsリソースの準備)
3. [フロントエンドのデプロイ（S3 + CloudFront）](#3-フロントエンドのデプロイs3--cloudfront)
4. [Lambda関数のデプロイ](#4-lambda関数のデプロイ)
5. [CI/CDパイプラインの構築](#5-cicdパイプラインの構築)
6. [セキュリティ設定](#6-セキュリティ設定)
7. [監視・ログ設定](#7-監視ログ設定)
8. [カスタムドメインの設定](#8-カスタムドメインの設定)

---

## 1. アーキテクチャ概要

```
┌─────────────────┐
│   CloudFront    │ ← CDN（高速配信）
└────────┬────────┘
         │
┌────────▼────────┐
│   S3 Bucket     │ ← 静的ファイル（Reactアプリ）
└─────────────────┘
         │
┌────────▼────────┐
│  API Gateway    │ ← REST API
└────────┬────────┘
         │
┌────────▼────────┐
│  Lambda Function│ ← Gemini API呼び出し
└─────────────────┘
         │
┌────────▼────────┐
│  Supabase       │ ← データベース + Storage
└─────────────────┘
```

---

## 2. AWSリソースの準備

### 2.1 AWSアカウントの準備

1. [AWS Console](https://console.aws.amazon.com/)にログイン
2. リージョンを `ap-northeast-1`（東京）に設定
3. IAMユーザーを作成（デプロイ用）
   - 必要な権限：
     - S3: フルアクセス
     - CloudFront: フルアクセス
     - Lambda: 更新権限
     - IAM: ロール作成権限（CloudFront用）

### 2.2 AWS CLIのインストールと設定

```bash
# AWS CLIのインストール（未インストールの場合）
# Windows: https://aws.amazon.com/cli/
# macOS: brew install awscli
# Linux: sudo apt install awscli

# 認証情報の設定
aws configure
# AWS Access Key ID: [IAMユーザーのアクセスキー]
# AWS Secret Access Key: [IAMユーザーのシークレットキー]
# Default region name: ap-northeast-1
# Default output format: json
```

---

## 3. フロントエンドのデプロイ（S3 + CloudFront）

### 3.1 S3バケットの作成

1. [S3 Console](https://console.aws.amazon.com/s3/)にアクセス
2. 「バケットを作成」をクリック
3. 以下の設定で作成：
   - **バケット名**: `bashotori-app`（グローバルで一意の名前）
   - **リージョン**: `アジアパシフィック（東京）ap-northeast-1`
   - **パブリックアクセス**: すべてブロック（CloudFront経由でアクセス）
   - **バケットバージョニング**: 無効（コスト削減）
   - **デフォルト暗号化**: 有効
4. 「バケットを作成」をクリック

### 3.2 ビルドとアップロード

```bash
# プロジェクトルートで実行
cd c:\Users\hoikuen\Desktop\time\bashotori

# 依存関係のインストール
npm install

# 本番用ビルド
npm run build

# S3バケットにアップロード
aws s3 sync dist/ s3://bashotori-app/ --delete

# キャッシュ無効化のため、index.htmlを個別にアップロード
aws s3 cp dist/index.html s3://bashotori-app/index.html --cache-control "no-cache"
```

### 3.3 S3バケットポリシーの設定

S3バケットの「アクセス許可」タブで、以下のバケットポリシーを設定：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bashotori-app/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::[アカウントID]:distribution/[ディストリビューションID]"
        }
      }
    }
  ]
}
```

> ⚠️ **注意**: CloudFrontディストリビューション作成後に、`[アカウントID]`と`[ディストリビューションID]`を実際の値に置き換えてください。

### 3.4 CloudFrontディストリビューションの作成

1. [CloudFront Console](https://console.aws.amazon.com/cloudfront/)にアクセス
2. 「ディストリビューションを作成」をクリック
3. 以下の設定で作成：

   **オリジン設定**
   - **オリジンドメイン**: `bashotori-app.s3.ap-northeast-1.amazonaws.com`
   - **オリジンアクセス**: `Origin access control settings (recommended)`
   - 「コントロール設定を作成」をクリック
     - **名前**: `bashotori-s3-oac`
     - **署名動作**: `Sign requests (recommended)`
   - **バケットアクセス**: `Yes, update the bucket policy`

   **デフォルトのキャッシュビヘイビア**
   - **ビューアープロトコルポリシー**: `Redirect HTTP to HTTPS`
   - **キャッシュキーとオリジンリクエスト**: `CachingOptimized`
   - **キャッシュポリシー**: `CachingOptimized`
   - **オリジンリクエストポリシー**: `CORS-S3Origin`

   **設定**
   - **価格クラス**: `Use only North America and Europe`（コスト削減）
   - **代替ドメイン名（CNAME）**: （カスタムドメイン使用時）
   - **SSL証明書**: （カスタムドメイン使用時）

4. 「ディストリビューションを作成」をクリック
5. デプロイ完了まで待機（約15-20分）

### 3.5 エラーページの設定

CloudFrontディストリビューションの「エラーページ」タブで：

1. 「カスタムエラーレスポンスを作成」をクリック
2. 以下の設定：
   - **HTTPエラーコード**: `403: Forbidden`
   - **カスタマイズエラーレスポンス**: `Yes`
   - **レスポンスページパス**: `/index.html`
   - **HTTPレスポンスコード**: `200: OK`
3. 同様に `404: Not Found` も設定

これにより、React Routerのクライアントサイドルーティングが正常に動作します。

---

## 4. Lambda関数のデプロイ

### 4.1 Lambda関数の作成（未作成の場合）

1. [Lambda Console](https://console.aws.amazon.com/lambda/)にアクセス
2. 「関数の作成」をクリック
3. 以下の設定：
   - **関数名**: `bashotori-gemini`
   - **ランタイム**: `Node.js 20.x`
   - **アーキテクチャ**: `x86_64`
4. 「関数の作成」をクリック

### 4.2 コードのデプロイ

```bash
# Lambda関数ディレクトリに移動
cd infrastructure/lambda

# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build

# ZIPファイルの作成（Windows PowerShell）
Compress-Archive -Path dist\gemini-handler.js -DestinationPath function.zip -Force

# Lambda関数にアップロード
aws lambda update-function-code \
  --function-name bashotori-gemini \
  --zip-file fileb://function.zip \
  --region ap-northeast-1
```

### 4.3 環境変数の設定

Lambda関数の「設定」→「環境変数」で：

- **Key**: `GEMINI_API_KEY`
- **Value**: Google Gemini APIキー

### 4.4 API Gatewayの設定

1. Lambda関数の「トリガーを追加」をクリック
2. 以下の設定：
   - **ソース**: `API Gateway`
   - **API**: `新しいAPIを作成`
   - **APIタイプ**: `REST API`
   - **セキュリティ**: `オープン`（本番では認証を追加推奨）
3. 「追加」をクリック
4. **APIエンドポイントURL**をコピー

---

## 5. CI/CDパイプラインの構築

### 5.1 GitHub Actionsワークフローの作成

`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: ap-northeast-1
  S3_BUCKET: bashotori-app
  CLOUDFRONT_DISTRIBUTION_ID: [CloudFrontディストリビューションID]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_AWS_API_GATEWAY_URL: ${{ secrets.VITE_AWS_API_GATEWAY_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ env.S3_BUCKET }}/ --delete
          aws s3 cp dist/index.html s3://${{ env.S3_BUCKET }}/index.html --cache-control "no-cache"

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

  deploy-lambda:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build Lambda function
        run: |
          cd infrastructure/lambda
          npm ci
          npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy Lambda function
        run: |
          cd infrastructure/lambda
          zip -r function.zip dist/
          aws lambda update-function-code \
            --function-name bashotori-gemini \
            --zip-file fileb://function.zip
```

### 5.2 GitHub Secretsの設定

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下を設定：

- `AWS_ACCESS_KEY_ID`: AWS IAMユーザーのアクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWS IAMユーザーのシークレットキー
- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名キー
- `VITE_AWS_API_GATEWAY_URL`: API GatewayエンドポイントURL
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFrontディストリビューションID

---

## 6. セキュリティ設定

### 6.1 Supabase RLSポリシーの強化

本番環境では、認証済みユーザーのみアクセス可能にします：

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

-- 認証済みユーザーのみ読み書き可能
CREATE POLICY "Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert"
ON store_visits FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update"
ON store_visits FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete"
ON store_visits FOR DELETE
USING (auth.role() = 'authenticated');
```

### 6.2 Storageポリシーの強化

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- 認証済みユーザーのみアクセス可能
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');
```

### 6.3 API Gatewayの認証追加（オプション）

1. API GatewayコンソールでAPIを開く
2. 「認証」→「APIキーを作成」
3. 「使用量プラン」を作成してAPIキーを関連付け
4. リソースに「APIキーが必要」を設定

---

## 7. 監視・ログ設定

### 7.1 CloudWatch Logsの設定

Lambda関数の「モニタリング」タブで：

1. 「CloudWatch Logs」を確認
2. 必要に応じてログ保持期間を設定（デフォルト: 無期限）

### 7.2 CloudWatchアラームの設定

1. [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)にアクセス
2. 「アラーム」→「アラームの作成」
3. Lambda関数のエラー率を監視：
   - **メトリクス**: `Errors`
   - **条件**: `>= 1`（エラーが1件以上）
   - **通知**: SNSトピックを作成してメール通知

### 7.3 S3アクセスログの有効化

1. S3バケットの「プロパティ」タブ
2. 「サーバーアクセスログ記録」を有効化
3. ログを保存する別のS3バケットを指定

---

## 8. カスタムドメインの設定

**bashotori.com など独自ドメインを CloudFront で使う詳細手順は [AWS_CUSTOM_DOMAIN.md](./AWS_CUSTOM_DOMAIN.md) を参照してください。**（ACM 証明書・CloudFront 設定・DNS の流れを記載）

### 8.1 概要

- **Route 53 でドメインを取得する場合**: [Route 53 Console](https://console.aws.amazon.com/route53/) → 「登録済みドメイン」→「ドメインを登録」
- **既存ドメイン（お名前.com 等）を使う場合**: そのまま DNS 管理画面で CNAME / A レコードを設定

### 8.2 CloudFront にカスタムドメインを追加

1. **ACM（us-east-1）** でドメイン用の SSL 証明書を発行（DNS 検証）
2. CloudFront ディストリビューションの「一般」→「編集」
3. 「代替ドメイン名（CNAME）」にドメイン（例: `bashotori.com`）を追加
4. 「カスタム SSL 証明書」で上記 ACM 証明書を選択

### 8.3 DNS で CloudFront に向ける

- **Route 53**: ホストゾーンで A レコード（エイリアス）を作成し、エイリアス先に CloudFront を指定
- **その他 DNS**: www は CNAME で CloudFront のドメイン名（`xxxxx.cloudfront.net`）を指定。ルートは ALIAS/ANAME が使えれば同様に指定

---

## 📝 デプロイチェックリスト

### 初回デプロイ前

- [ ] AWSアカウントの準備
- [ ] IAMユーザーの作成と権限設定
- [ ] AWS CLIのインストールと設定
- [ ] S3バケットの作成
- [ ] CloudFrontディストリビューションの作成
- [ ] Lambda関数の作成とデプロイ
- [ ] API Gatewayの設定
- [ ] GitHub Secretsの設定
- [ ] 環境変数の確認

### セキュリティ

- [ ] Supabase RLSポリシーの設定
- [ ] Storageポリシーの設定
- [ ] API Gatewayの認証設定（オプション）
- [ ] S3バケットのパブリックアクセスブロック
- [ ] CloudFrontのHTTPS強制

### 監視・運用

- [ ] CloudWatch Logsの確認
- [ ] CloudWatchアラームの設定
- [ ] エラーハンドリングの確認
- [ ] バックアップ戦略の検討

---

## 🔧 トラブルシューティング

### S3アップロードエラー

**エラー**: `Access Denied`

**解決方法**:
- IAMユーザーの権限を確認
- S3バケットポリシーを確認

### CloudFrontキャッシュ問題

**問題**: 更新が反映されない

**解決方法**:
```bash
# キャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id [ディストリビューションID] \
  --paths "/*"
```

### Lambda関数エラー

**エラー**: `Timeout`

**解決方法**:
- Lambda関数のタイムアウト設定を30秒以上に変更
- CloudWatch Logsでエラー詳細を確認

---

## 📚 参考リンク

- [AWS S3 ドキュメント](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront ドキュメント](https://docs.aws.amazon.com/cloudfront/)
- [AWS Lambda ドキュメント](https://docs.aws.amazon.com/lambda/)
- [GitHub Actions ドキュメント](https://docs.github.com/actions)

---

## 🚀 次のステップ

- [ ] 認証機能の実装（Supabase Auth）
- [ ] パフォーマンス最適化
- [ ] エラートラッキング（Sentry等）
- [ ] 自動バックアップの設定
- [ ] マルチリージョン対応

