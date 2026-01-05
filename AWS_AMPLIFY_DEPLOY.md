# AWS Amplify デプロイガイド

このガイドでは、BASHOTORIアプリケーションをAWS Amplifyにデプロイする手順を説明します。

## 目次

1. [前提条件](#1-前提条件)
2. [Amplifyコンソールでの設定](#2-amplifyコンソールでの設定)
3. [環境変数の設定](#3-環境変数の設定)
4. [ビルド設定の確認](#4-ビルド設定の確認)
5. [デプロイの実行](#5-デプロイの実行)
6. [カスタムドメインの設定](#6-カスタムドメインの設定)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

- AWSアカウントを持っていること
- GitHubリポジトリにコードがプッシュされていること
- Supabaseプロジェクトが設定済みであること

---

## 2. Amplifyコンソールでの設定

### 2.1 Amplifyコンソールにアクセス

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. AWSアカウントでログイン

### 2.2 新しいアプリの作成

1. 「New app」→「Host web app」をクリック
2. 「GitHub」を選択して「Continue」をクリック
3. GitHubアカウントを認証（初回のみ）
4. リポジトリを選択：
   - **Repository**: `ShoheiAsogawa/BASHOTORI`
   - **Branch**: `main`
5. 「Next」をクリック

### 2.3 ビルド設定

Amplifyは自動的に`amplify.yml`を検出します。設定が正しく表示されていることを確認：

- **Build settings**: `amplify.yml`が表示されていること
- **App name**: アプリ名を設定（例: `bashotori`）

「Next」をクリック

---

## 3. 環境変数の設定

### 3.1 必須環境変数

「Environment variables」セクションで以下の環境変数を追加：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_SUPABASE_URL` | SupabaseプロジェクトのURL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabaseの匿名キー | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_GEMINI_API_KEY` | Google Gemini APIキー（オプション） | `AIzaSy...` |
| `VITE_AWS_API_GATEWAY_URL` | AWS API GatewayエンドポイントURL（オプション） | `https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod` |

### 3.2 環境変数の追加方法

1. 「Environment variables」セクションで「Manage variables」をクリック
2. 「Add variable」をクリック
3. 変数名と値を入力
4. 「Save」をクリック

### 3.3 環境ごとの設定（オプション）

複数の環境（開発、本番）を使用する場合：

1. 左メニューの「App settings」→「Environment variables」をクリック
2. 環境を選択（例: `main`、`develop`）
3. 各環境に適切な値を設定

---

## 4. ビルド設定の確認

### 4.1 amplify.ymlの確認

プロジェクトルートに`amplify.yml`が存在することを確認：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 4.2 カスタムビルド設定（必要に応じて）

ビルドエラーが発生する場合、`amplify.yml`を編集：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "Node version:"
        - node --version
        - echo "NPM version:"
        - npm --version
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 5. デプロイの実行

### 5.1 初回デプロイ

1. 「Save and deploy」をクリック
2. ビルドプロセスが開始されます
3. ビルドログを確認：
   - 「Build logs」タブでリアルタイムのログを確認
   - エラーが発生した場合はログを確認して修正

### 5.2 デプロイの確認

ビルドが完了すると：

1. 「Provision」→「Build」→「Deploy」の各ステップが完了
2. 「Deploy」ステップでURLが表示されます
   - 例: `https://main.xxxxx.amplifyapp.com`
3. URLをクリックしてアプリケーションが正常に動作することを確認

### 5.3 自動デプロイの設定

デフォルトで、`main`ブランチへのプッシュ時に自動デプロイが実行されます。

他のブランチでも自動デプロイする場合：

1. 左メニューの「App settings」→「General」をクリック
2. 「Branch management」でブランチを追加
3. 各ブランチの設定を確認

---

## 6. カスタムドメインの設定

### 6.1 ドメインの追加

1. 左メニューの「Domain management」をクリック
2. 「Add domain」をクリック
3. ドメイン名を入力（例: `bashotori.example.com`）
4. 「Configure domain」をクリック

### 6.2 DNS設定

1. Amplifyが提供するDNSレコードをコピー
2. ドメインのDNS設定でレコードを追加：
   - **Type**: `CNAME`
   - **Name**: `bashotori`（サブドメイン）
   - **Value**: Amplifyが提供する値
3. DNSの反映を待つ（数分〜数時間）

### 6.3 SSL証明書

Amplifyが自動的にSSL証明書を発行・設定します（数分かかる場合があります）。

---

## 7. トラブルシューティング

### 7.1 ビルドエラー

**エラー: `npm ci` failed**

- `package-lock.json`が存在することを確認
- リポジトリに`package-lock.json`をコミット

**エラー: Environment variables not found**

- 環境変数が正しく設定されているか確認
- 変数名が`VITE_`で始まっているか確認（Viteの要件）

**エラー: Build failed**

- ビルドログを確認
- ローカルで`npm run build`が成功するか確認

### 7.2 ランタイムエラー

**エラー: Supabase client is not initialized**

- `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`が設定されているか確認
- 環境変数が正しく反映されているか確認（ブラウザの開発者ツールで確認）

**エラー: CORS error**

- Supabase Dashboardで認証済みURLにAmplifyのURLを追加
- Supabase → Authentication → URL Configuration

### 7.3 パフォーマンスの問題

**ビルドが遅い**

- `amplify.yml`でキャッシュを有効化（既に設定済み）
- 不要なファイルを`.gitignore`に追加

**アプリの読み込みが遅い**

- CloudFrontのキャッシュ設定を確認
- 画像の最適化を確認

---

## 8. 継続的デプロイ（CI/CD）

### 8.1 自動デプロイの動作

- `main`ブランチへのプッシュで自動デプロイ
- プルリクエストの作成でプレビュー環境を自動作成

### 8.2 プレビュー環境

1. プルリクエストを作成
2. Amplifyが自動的にプレビュー環境を作成
3. プルリクエストにプレビューURLがコメントとして追加

### 8.3 手動デプロイ

特定のコミットを再デプロイする場合：

1. 「Deployments」タブを開く
2. 再デプロイしたいコミットを選択
3. 「Redeploy this version」をクリック

---

## 9. モニタリングとログ

### 9.1 ビルドログ

- 「Build logs」タブでビルドプロセスのログを確認
- エラーが発生した場合は詳細を確認

### 9.2 アプリケーションログ

- CloudWatch Logsでアプリケーションのログを確認
- エラーやパフォーマンスの問題を監視

### 9.3 メトリクス

- Amplify Consoleでビルド時間、デプロイ時間を確認
- アプリケーションのパフォーマンスメトリクスを確認

---

## 10. セキュリティのベストプラクティス

### 10.1 環境変数の保護

- 機密情報は環境変数で管理
- `.env`ファイルをGitにコミットしない（`.gitignore`に追加済み）
- Amplify Consoleで環境変数を設定

### 10.2 HTTPSの強制

- Amplifyは自動的にHTTPSを有効化
- カスタムドメインでもSSL証明書が自動発行

### 10.3 アクセス制御

- Amplify ConsoleへのアクセスをIAMで制御
- 必要に応じてMFAを有効化

---

## 11. コスト最適化

### 11.1 ビルド時間の短縮

- キャッシュを活用（`amplify.yml`で設定済み）
- 不要な依存関係を削除

### 11.2 ストレージの最適化

- 不要なファイルを`.gitignore`に追加
- 画像はSupabase Storageに保存（Amplifyのストレージは使用しない）

---

## 12. 次のステップ

デプロイが完了したら：

1. ✅ アプリケーションが正常に動作するか確認
2. ✅ ログイン機能が動作するか確認
3. ✅ 管理者と読み取り専用ユーザーで権限が正しく動作するか確認
4. ✅ カスタムドメインを設定（オプション）
5. ✅ モニタリングとアラートを設定（オプション）

---

## 参考リンク

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Amplify Console](https://console.aws.amazon.com/amplify/)
- [Vite Documentation](https://vitejs.dev/)

---

以上でAWS Amplifyへのデプロイ設定は完了です。

