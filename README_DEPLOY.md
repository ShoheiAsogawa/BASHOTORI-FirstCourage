# AWSデプロイクイックガイド

このガイドでは、BASHOTORIアプリケーションをAWSにデプロイする手順を簡潔に説明します。

## 🚀 クイックデプロイ

### 前提条件

1. **AWSアカウント**の準備
2. **AWS CLI**のインストールと設定
   ```bash
   aws configure
   ```
3. **S3バケット**の作成（例: `bashotori-app`）
4. **CloudFrontディストリビューション**の作成（オプション）

### デプロイ方法

#### 方法1: デプロイスクリプトを使用（推奨）

```powershell
# すべてをデプロイ
npm run deploy

# フロントエンドのみ
npm run deploy:frontend

# Lambda関数のみ
npm run deploy:lambda
```

#### 方法2: 手動デプロイ

```powershell
# 1. ビルド
npm run build

# 2. S3にアップロード
aws s3 sync dist/ s3://bashotori-app/ --delete

# 3. CloudFrontキャッシュを無効化（オプション）
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

## 📋 詳細な手順

詳細な手順は [AWS_DEPLOY.md](./AWS_DEPLOY.md) を参照してください。

## 🔧 環境変数の設定

デプロイ前に、以下の環境変数が設定されていることを確認してください：

- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名キー
- `VITE_AWS_API_GATEWAY_URL`: API GatewayエンドポイントURL（オプション）

## 🔐 GitHub Actions CI/CD

`main`ブランチにプッシュすると、自動的にデプロイされます。

GitHub Secretsに以下を設定してください：

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AWS_API_GATEWAY_URL`
- `CLOUDFRONT_DISTRIBUTION_ID`（オプション）

## 📝 デプロイチェックリスト

- [ ] AWS CLIがインストール・設定されている
- [ ] S3バケットが作成されている
- [ ] CloudFrontディストリビューションが作成されている（オプション）
- [ ] Lambda関数が作成されている
- [ ] 環境変数が設定されている
- [ ] ビルドが成功する

## 🆘 トラブルシューティング

### エラー: Access Denied

→ IAMユーザーの権限を確認してください。

### エラー: ビルドに失敗

→ 環境変数が正しく設定されているか確認してください。

### CloudFrontで更新が反映されない

→ キャッシュを無効化してください：
```bash
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

