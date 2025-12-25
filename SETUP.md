# BASHOTORI セットアップガイド

このガイドでは、BASHOTORIアプリケーションをSupabaseとAWSにセットアップする手順を説明します。

## 目次

1. [Supabaseのセットアップ](#1-supabaseのセットアップ)
2. [AWS Lambda関数のセットアップ](#2-aws-lambda関数のセットアップ)
3. [フロントエンドのセットアップ](#3-フロントエンドのセットアップ)
4. [デプロイ](#4-デプロイ)

---

## 1. Supabaseのセットアップ

### 1.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `bashotori`
   - **Database Password**: 強力なパスワードを設定
   - **Region**: `Northeast Asia (Tokyo)` を推奨
4. プロジェクト作成を待つ（数分かかります）

### 1.2 データベースマイグレーションの実行

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容をコピー
3. SQL Editorに貼り付けて実行

### 1.3 Storageバケットの作成

1. Supabaseダッシュボードで「Storage」を開く
2. 「Create a new bucket」をクリック
3. 以下の設定で作成：
   - **Name**: `store-visit-photos`
   - **Public bucket**: ✅ チェックを入れる（画像を公開するため）
4. 「Create bucket」をクリック

### 1.4 Storageポリシーの設定

Storageバケット作成後、以下のSQLを実行してポリシーを設定：

```sql
-- 全ユーザーが読み取り可能
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos');

-- 全ユーザーがアップロード可能（本番環境では認証を追加推奨）
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos');

-- 全ユーザーが削除可能（本番環境では認証を追加推奨）
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos');
```

### 1.5 APIキーの取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 2. AWS Lambda関数のセットアップ

### 2.1 Lambda関数の作成

1. [AWS Lambda Console](https://console.aws.amazon.com/lambda/)にアクセス
2. 「Create function」をクリック
3. 以下の設定で作成：
   - **Function name**: `bashotori-gemini`
   - **Runtime**: `Node.js 20.x`
   - **Architecture**: `x86_64`
4. 「Create function」をクリック

### 2.2 環境変数の設定

1. Lambda関数の「Configuration」→「Environment variables」を開く
2. 以下の環境変数を追加：
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Google Gemini APIキー（[Google AI Studio](https://makersuite.google.com/app/apikey)で取得）

### 3.3 コードのデプロイ

1. `infrastructure/lambda/gemini-handler.ts` をJavaScriptにコンパイル：
   ```bash
   cd infrastructure/lambda
   npm install
   npm run build
   ```

2. Lambda関数のコードエディタに `dist/gemini-handler.js` の内容をコピー＆ペースト

3. 「Deploy」をクリック

### 2.4 API Gatewayの設定

1. Lambda関数の「Add trigger」をクリック
2. 「API Gateway」を選択
3. 以下の設定：
   - **API**: Create an API
   - **API type**: REST API
   - **Security**: Open（開発用、本番では認証を追加）
4. 「Add」をクリック
5. API GatewayのエンドポイントURLをコピー → `VITE_AWS_API_GATEWAY_URL`

### 2.5 CORSの設定（必要に応じて）

API GatewayでCORSを有効化：
1. API Gatewayコンソールで作成したAPIを選択
2. 「Actions」→「Enable CORS」
3. 設定を適用

---

## 3. フロントエンドのセットアップ

### 3.1 依存関係のインストール

```bash
cd bashotori
npm install
```

### 3.2 環境変数の設定

`.env`ファイルを作成：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_AWS_API_GATEWAY_URL=your_aws_api_gateway_url
```

### 3.3 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて動作確認

---

## 4. デプロイ

### 4.1 ビルド

```bash
npm run build
```

### 4.2 デプロイ先の選択

#### オプション1: Vercel（推奨）

1. [Vercel](https://vercel.com)にアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

#### オプション2: AWS S3 + CloudFront

1. S3バケットを作成
2. `dist`フォルダの内容をアップロード
3. CloudFrontディストリビューションを作成
4. カスタムドメインを設定（オプション）

#### オプション3: Netlify

1. [Netlify](https://netlify.com)にアカウント作成
2. GitHubリポジトリを接続
3. ビルド設定：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. 環境変数を設定
5. デプロイ

---

## トラブルシューティング

### Supabase接続エラー

- `.env`ファイルの値が正しいか確認
- Supabaseプロジェクトがアクティブか確認
- RLSポリシーが正しく設定されているか確認

### 画像アップロードエラー

- Storageバケットが作成されているか確認
- Storageポリシーが正しく設定されているか確認
- バケット名が `store-visit-photos` になっているか確認

### Gemini APIエラー

- Lambda関数の環境変数が設定されているか確認
- API GatewayのエンドポイントURLが正しいか確認
- CORSが有効になっているか確認

---

## セキュリティ注意事項

⚠️ **本番環境では以下を実施してください：**

1. **Supabase RLS**: 認証ユーザーのみアクセス可能にする
2. **Storageポリシー**: 認証済みユーザーのみアップロード可能にする
3. **API Gateway**: APIキーまたは認証を追加
4. **環境変数**: 機密情報は環境変数で管理し、Gitにコミットしない

---

## 次のステップ

- [ ] 認証機能の追加（Supabase Auth）
- [ ] 本番環境のセキュリティ設定
- [ ] 監視・ログ設定（CloudWatch等）
- [ ] カスタムドメインの設定

