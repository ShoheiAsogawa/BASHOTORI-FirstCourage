# AWS Amplify 環境変数チェックリスト

## 現在の設定確認

画像から確認できる設定：

### ✅ 正しく設定されているもの
- **VITE_SUPABASE_URL**: `https://xxxxx.supabase.co` ✓

### ⚠️ 修正が必要なもの

#### 1. VITE_SUPABASE_ANON_KEY
**現在の値**: `sb_secret_xxxxx`（例）

**問題点**: 
- `sb_secret_`で始まっているため、これは`service_role`キーの可能性があります
- フロントエンドでは`anon public`キーを使用する必要があります

**正しい値の取得方法**:
1. Supabase Dashboard → Settings → API
2. 「Project API keys」セクションの`anon public`キーをコピー
3. 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長いJWTトークン）

**⚠️ 重要**: `service_role`キーは**絶対に**フロントエンドで使用しないでください。サーバーサイド専用です。

#### 2. VITE_GEMINI_API_KEY
**現在の値**: `AlzaSyxxxxx`（例）


**問題点**:
- 正しい形式は`AIzaSy...`で始まるはずです（最初の`A`が欠けている可能性）

**確認方法**:
- Google AI StudioまたはGoogle Cloud ConsoleでAPIキーを確認
- 正しい形式: `AIzaSy...`（`AI`で始まる）

## 修正手順

### 1. Supabaseのanonキーを確認

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. 左メニュー → 「Settings」→「API」
4. 「Project API keys」セクションを確認
5. **`anon public`**キーをコピー（`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`で始まるもの）

### 2. Gemini APIキーを確認

1. [Google AI Studio](https://makersuite.google.com/app/apikey)または[Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. APIキーを確認
3. 正しい形式: `AIzaSy...`（`AI`で始まる）

### 3. AWS Amplify Consoleで更新

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. アプリ「BASHOTORI」を選択
3. 左メニュー → 「ホスティング」→「環境変数」
4. 「変数を管理」をクリック
5. 各変数を編集：
   - **VITE_SUPABASE_ANON_KEY**: `anon public`キーに変更
   - **VITE_GEMINI_API_KEY**: 正しいAPIキーに変更（必要に応じて）
6. 「保存」をクリック
7. 自動的に再デプロイが開始されます

## 環境変数の正しい設定値

| 変数名 | 正しい形式 | 例 |
|--------|-----------|-----|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | JWTトークン形式（長い文字列） |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | `AIzaSyxxxxx`（例） |
| `VITE_AWS_API_GATEWAY_URL` | `https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod` | （オプション） |

## 確認方法

環境変数を更新した後：

1. ビルドログを確認
   - Amplify Console → 「ビルド」タブ
   - エラーがないか確認

2. ブラウザの開発者ツールで確認
   - デプロイされたアプリを開く
   - F12で開発者ツールを開く
   - Consoleタブで以下を確認：
     ```
     Supabase環境変数チェック: {
       url: "✓ 設定済み",
       key: "✓ 設定済み"
     }
     ✅ Supabase client initialized successfully
     ```

3. アプリケーションの動作確認
   - ログイン画面が表示されるか
   - ログインが正常に動作するか

## トラブルシューティング

### エラー: "Supabase client is not initialized"
- 環境変数が正しく設定されているか確認
- ビルドログで環境変数が読み込まれているか確認

### エラー: "Invalid API key"
- Supabaseの`anon public`キーを使用しているか確認
- `service_role`キーを使用していないか確認

### エラー: CORS error
- Supabase Dashboard → Authentication → URL Configuration
- AmplifyのURLを追加（例: `https://main.xxxxx.amplifyapp.com`）

---

**次のステップ**: 環境変数を修正したら、自動的に再デプロイが開始されます。ビルドが完了するまで待ってから、アプリケーションを確認してください。

