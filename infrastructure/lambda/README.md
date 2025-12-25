# BASHOTORI Lambda Functions

Gemini APIを呼び出すためのAWS Lambda関数です。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. デプロイ

#### 方法1: AWS CLI

```bash
# ZIPファイルを作成
zip -r function.zip dist/ node_modules/ package.json

# Lambda関数にアップロード
aws lambda update-function-code \
  --function-name bashotori-gemini \
  --zip-file fileb://function.zip
```

#### 方法2: AWS Console

1. `dist/gemini-handler.js` の内容をコピー
2. Lambda関数のコードエディタに貼り付け
3. 「Deploy」をクリック

## 環境変数

以下の環境変数をLambda関数に設定してください：

- `GEMINI_API_KEY`: Google Gemini APIキー

## API Gateway設定

Lambda関数にAPI Gatewayトリガーを追加し、REST APIエンドポイントを作成してください。

エンドポイントURLをフロントエンドの `.env` ファイルの `VITE_AWS_API_GATEWAY_URL` に設定します。

