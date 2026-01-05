# Lambda関数デプロイ手順

## ZIPファイルの作成（Windows PowerShell）

```powershell
cd infrastructure/lambda
Compress-Archive -Path dist\gemini-handler.js -DestinationPath function.zip -Force
```

## AWS Lambda関数へのアップロード

### 1. Lambda関数の準備

1. [AWS Lambda Console](https://console.aws.amazon.com/lambda/)にアクセス
2. 関数 `bashotori-gemini` を開く（まだ作成していない場合は作成）

### 2. ZIPファイルのアップロード

1. Lambda関数の「コード」タブを開く
2. 「アップロード元」ドロップダウンをクリック
3. 「.zipファイル」を選択
4. 「アップロード」をクリック
5. `function.zip` ファイルを選択
6. 「保存」をクリック

### 3. 環境変数の設定

1. 「設定」タブを開く
2. 「環境変数」をクリック
3. 「編集」をクリック
4. 以下の環境変数を追加：
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Google Gemini APIキー
5. 「保存」をクリック

### 4. API Gatewayトリガーの追加

1. 「コード」タブに戻る
2. 「トリガーを追加」をクリック
3. 以下の設定：
   - **ソース**: `API Gateway`
   - **API**: `新しいAPIを作成`
   - **APIタイプ**: `REST API`
   - **セキュリティ**: `オープン`（開発用）
4. 「追加」をクリック
5. **APIエンドポイントURL**をコピー

### 5. 環境変数の更新

`.env` ファイルに以下を追加：

```env
VITE_AWS_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/default/bashotori-gemini
```

## 動作確認

1. Lambda関数の「テスト」タブでテストイベントを作成
2. 以下のJSONを入力：

```json
{
  "httpMethod": "POST",
  "body": "{\"prompt\": \"テストメッセージ\"}"
}
```

3. 「テスト」をクリック
4. レスポンスを確認

## トラブルシューティング

### エラー: "Cannot find module"
→ node_modulesが必要な場合は、ZIPファイルに含めてください

### エラー: "GEMINI_API_KEY is not set"
→ 環境変数が正しく設定されているか確認

### エラー: "Timeout"
→ Lambda関数のタイムアウト設定を30秒以上に変更

