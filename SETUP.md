# BASHOTORI セットアップガイド

このガイドでは、BASHOTORIアプリケーションをSupabaseと連携させてセットアップする手順を説明します。

## 目次

1. [Supabaseのセットアップ](#1-supabaseのセットアップ)
2. [Gemini API（AI店舗検索）](#2-gemini-apiai店舗検索)
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

## 2. Gemini API（AI店舗検索）

AI店舗検索を使う場合は、[Google AI Studio](https://makersuite.google.com/app/apikey) などで API キーを取得し、`.env` に `VITE_GEMINI_API_KEY` を設定します。GitHub Pages では同じ名前の **Repository Secret** を設定し、ワークフローのビルド時に注入してください。

> 公開リポジトリでは、ブラウザに埋め込まれる `VITE_*` は利用者に見える前提で扱い、キーの制限（HTTP リファラー等）を必ず設定してください。

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

#### GitHub Pages（このリポジトリの既定）

1. **Settings → Pages** でソースに **GitHub Actions** を選ぶ
2. **Actions** 用 Secrets に Supabase と必要なら Gemini の `VITE_*` を登録
3. `main` へプッシュして `.github/workflows/pages.yml` を実行

#### その他: Vercel / Netlify

ビルドコマンド `npm run build`、成果物ディレクトリ `dist`、環境変数は上記と同様に設定する。

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

- `VITE_GEMINI_API_KEY` が `.env` または GitHub Secrets に設定されているか確認
- API キーのクォータ・リファラー制限を確認

---

## セキュリティ注意事項

⚠️ **本番環境では以下を実施してください：**

1. **Supabase RLS**: 認証ユーザーのみアクセス可能にする
2. **Storageポリシー**: 認証済みユーザーのみアップロード可能にする
3. **Gemini API キー**: 公開サイトではキー制限を必ず設定する
4. **環境変数**: 機密情報は環境変数で管理し、Gitにコミットしない

---

## 次のステップ

- [ ] 認証機能の追加（Supabase Auth）
- [ ] 本番環境のセキュリティ設定
- [ ] 運用時のログ・エラー監視の検討
- [ ] カスタムドメインの設定

