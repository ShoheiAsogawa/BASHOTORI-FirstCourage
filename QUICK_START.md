# BASHOTORI クイックスタートガイド

このガイドでは、最短でBASHOTORIアプリケーションを動かす手順を説明します。

## ⚡ 5分で動かす

### ステップ1: Supabaseプロジェクト作成（2分）

1. [Supabase](https://supabase.com)にアクセスしてアカウント作成
2. 「New Project」→ プロジェクト名: `bashotori`、リージョン: `Tokyo`
3. データベースパスワードを設定（メモしておく）

### ステップ2: データベースセットアップ（1分）

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容をコピー＆ペースト
3. 「Run」をクリック

### ステップ3: Storage設定（1分）

1. 「Storage」→「Create a new bucket」
2. 名前: `store-visit-photos`、Public: ✅
3. バケット作成後、「Policies」タブで以下を実行：

```sql
-- SQL Editorで実行
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos');

CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos');

CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos');
```

### ステップ4: 環境変数設定（30秒）

1. `bashotori/.env` ファイルを作成
2. Supabaseの「Settings」→「API」から以下をコピー：

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ステップ5: 起動（30秒）

```bash
cd bashotori
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開く！

---

## 📝 詳細な手順

より詳しい手順は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照してください。

## 🚀 Gemini API（AI検索機能を使う場合）

AI店舗検索を使う場合は、[Google AI Studio](https://makersuite.google.com/app/apikey) で API キーを取得し、`.env` に `VITE_GEMINI_API_KEY` を設定します。GitHub Pages では同じ名前の Repository Secret を登録してください。

詳細は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) の「6. Gemini API（AI店舗検索）」を参照。

---

## ✅ 動作確認チェックリスト

- [ ] カレンダーが表示される
- [ ] 新規登録ボタンが動作する
- [ ] フォームが開く
- [ ] データが保存される（SupabaseのTable Editorで確認）
- [ ] 画像がアップロードされる（SupabaseのStorageで確認）
- [ ] AI検索が動作する（`VITE_GEMINI_API_KEY` 設定後）

---

## 🆘 よくあるエラー

### `Missing Supabase environment variables`
→ `.env` ファイルが正しい場所にあるか確認

### `Error uploading image`
→ Storageバケット名が `store-visit-photos` になっているか確認

### `Gemini API request failed`
→ `VITE_GEMINI_API_KEY` と API キーの制限・クォータを確認

