# AWS Amplify 環境変数 クイック修正ガイド

## ⚠️ 現在の設定に問題があります

画像から確認した設定：

### 問題点

1. **VITE_SUPABASE_ANON_KEY**: `sb_secret_J555RrYgEW0F5qFEr2XUGA_d6B9MAS8`
   - ❌ `sb_secret_`で始まっているため、これは`service_role`キーです
   - ✅ フロントエンドでは`anon public`キーを使用する必要があります

2. **VITE_GEMINI_API_KEY**: `AlzaSyB9bNiU-XMW1JahXzrc2jRh5irNKPAeUoU`
   - ⚠️ 最初の`A`が欠けている可能性があります（正しくは`AIzaSy...`）

### ✅ 正しく設定されているもの

- **VITE_SUPABASE_URL**: `https://nfxzluqlprkelwociuaa.supabase.co` ✓

---

## 修正手順

### ステップ1: Supabaseのanonキーを取得

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. 左メニュー → **「Settings」**（⚙️アイコン）→ **「API」**
4. 「Project API keys」セクションを確認
5. **`anon public`**キーをコピー
   - 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長いJWTトークン）
   - ⚠️ **`service_role`キーは使用しないでください**

### ステップ2: Gemini APIキーを確認（必要に応じて）

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを確認
3. 正しい形式: `AIzaSy...`（`AI`で始まる）

### ステップ3: AWS Amplify Consoleで更新

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. アプリ「BASHOTORI」を選択
3. 左メニュー → **「ホスティング」** → **「環境変数」**
4. **「変数を管理」**ボタンをクリック
5. 以下の変数を編集：

   **VITE_SUPABASE_ANON_KEY**:
   - 現在の値: `sb_secret_J555RrYgEW0F5qFEr2XUGA_d6B9MAS8` ❌
   - 新しい値: Supabase Dashboardから取得した`anon public`キー ✅
   - 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   **VITE_GEMINI_API_KEY**（必要に応じて）:
   - 現在の値: `AlzaSyB9bNiU-XMW1JahXzrc2jRh5irNKPAeUoU`
   - 新しい値: `AIzaSyB9bNiU-XMW1JahXzrc2jRh5irNKPAeUoU`（最初に`A`を追加）

6. **「保存」**をクリック
7. 自動的に再デプロイが開始されます

---

## 正しい環境変数の形式

| 変数名 | 正しい形式 | 例 |
|--------|-----------|-----|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | `https://nfxzluqlprkelwociuaa.supabase.co` ✓ |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | JWTトークン形式（長い文字列） |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | `AIzaSyB9bNiU-XMW1JahXzrc2jRh5irNKPAeUoU` |

---

## 確認方法

環境変数を更新した後：

1. **ビルドログを確認**
   - Amplify Console → 「ビルド」タブ
   - エラーがないか確認

2. **ブラウザの開発者ツールで確認**
   - デプロイされたアプリを開く（例: `https://main.d31rs0a0flg3u3.amplifyapp.com`）
   - F12で開発者ツールを開く
   - Consoleタブで以下を確認：
     ```
     Supabase環境変数チェック: {
       url: "✓ 設定済み",
       key: "✓ 設定済み"
     }
     ✅ Supabase client initialized successfully
     ```

3. **アプリケーションの動作確認**
   - ログイン画面が表示されるか
   - ログインが正常に動作するか

---

## よくある間違い

### ❌ 間違い: `service_role`キーを使用
```
VITE_SUPABASE_ANON_KEY = sb_secret_xxxxx
```
- これはサーバーサイド専用のキーです
- フロントエンドで使用するとセキュリティリスクがあります

### ✅ 正しい: `anon public`キーを使用
```
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- フロントエンドで安全に使用できます
- RLS（Row Level Security）で保護されています

---

**次のステップ**: 環境変数を修正したら、自動的に再デプロイが開始されます。ビルドが完了するまで待ってから、アプリケーションを確認してください。

