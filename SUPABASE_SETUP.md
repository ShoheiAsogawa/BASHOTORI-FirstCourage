# Supabase セットアップ手順

このガイドでは、BASHOTORIアプリケーションをSupabaseと連携させてセットアップする詳細な手順を説明します。

## 📋 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [データベースマイグレーションの実行](#2-データベースマイグレーションの実行)
3. [Storageバケットの作成](#3-storageバケットの作成)
4. [RLSポリシーの設定](#4-rlsポリシーの設定)
5. [APIキーの取得](#5-apiキーの取得)
6. [Gemini API（AI店舗検索）](#6-gemini-apiai店舗検索)
7. [環境変数の設定](#7-環境変数の設定)
8. [動作確認](#8-動作確認)

---

## 1. Supabaseプロジェクトの作成

### 1.1 Supabaseアカウントの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」または「Sign in」をクリック
3. GitHubアカウントでサインイン（推奨）またはメールアドレスで登録

### 1.2 新規プロジェクトの作成

1. ダッシュボードで「New Project」をクリック
2. 以下の情報を入力：

   **組織の選択**
   - 既存の組織を選択、または新規作成

   **プロジェクト情報**
   - **Name**: `bashotori`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（**必ずメモしておく**）
     - 例: `YourSecurePassword123!@#`
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本からのアクセスが速い）
   - **Pricing Plan**: Free tier で開始可能

3. 「Create new project」をクリック
4. プロジェクトの作成を待つ（**約2-3分**）

> ⚠️ **重要**: データベースパスワードは後で変更できません。必ず安全な場所に保存してください。

---

## 2. データベースマイグレーションの実行

### 2.1 SQL Editorを開く

1. Supabaseダッシュボードで左メニューの「SQL Editor」をクリック
2. 「New query」をクリック

### 2.2 マイグレーションファイルの内容をコピー

1. ローカルの `supabase/migrations/001_initial_schema.sql` ファイルを開く
2. ファイルの内容をすべてコピー

### 2.3 SQLを実行

1. SQL Editorに貼り付け
2. 「Run」ボタンをクリック（または `Ctrl+Enter` / `Cmd+Enter`）
3. 成功メッセージが表示されることを確認

**実行される内容：**
- `store_visits` テーブルの作成
- インデックスの作成
- `updated_at` 自動更新トリガーの設定
- RLS（Row Level Security）の有効化

### 2.4 テーブルの確認

1. 左メニューの「Table Editor」をクリック
2. `store_visits` テーブルが作成されていることを確認
3. カラムが正しく作成されているか確認

---

## 3. Storageバケットの作成

### 3.1 Storageページを開く

1. 左メニューの「Storage」をクリック
2. 「Create a new bucket」をクリック

### 3.2 バケットの作成

以下の設定で作成：

- **Name**: `store-visit-photos`（**正確にこの名前**）
- **Public bucket**: ✅ **チェックを入れる**（画像を公開するため）
- **File size limit**: `5 MB`（デフォルト）
- **Allowed MIME types**: 空欄（すべて許可）

3. 「Create bucket」をクリック

### 3.3 Storageポリシーの設定

Storageポリシーは**SQL Editor**で実行する方法を推奨します（より確実です）。

#### 方法1: SQL Editorで実行（推奨）

1. 左メニューの「SQL Editor」を開く
2. 「New query」をクリック
3. 以下のSQLを**すべて**コピー＆ペーストして実行：

```sql
-- 既存のポリシーを削除（エラーを防ぐため）
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- ポリシー1: 公開読み取り
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos');

-- ポリシー2: 公開アップロード（開発用）
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos');

-- ポリシー3: 公開削除（開発用）
CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos');
```

4. 「Run」ボタンをクリック（または `Ctrl+Enter` / `Cmd+Enter`）
5. 成功メッセージが表示されることを確認

#### 方法2: Storage UIで設定（GUI方式）

もしSQL Editorでエラーが出る場合は、Storage UIから設定できます：

1. 作成したバケット（`store-visit-photos`）をクリック
2. 「Policies」タブをクリック
3. 「New Policy」をクリック

**ポリシー1: 公開読み取り**
- ポリシー名: `Public Read Access`
- Allowed operation: `SELECT`
- Target roles: `public` を選択
- USING expression: `bucket_id = 'store-visit-photos'`
- 「Review」→「Save policy」

**ポリシー2: 公開アップロード**
- ポリシー名: `Public Upload Access`
- Allowed operation: `INSERT`
- Target roles: `public` を選択
- WITH CHECK expression: `bucket_id = 'store-visit-photos'`
- 「Review」→「Save policy」

**ポリシー3: 公開削除**
- ポリシー名: `Public Delete Access`
- Allowed operation: `DELETE`
- Target roles: `public` を選択
- USING expression: `bucket_id = 'store-visit-photos'`
- 「Review」→「Save policy」

> ⚠️ **注意**: Storage UIの「For full customization」オプションでSQLを入力する場合、**CREATE POLICY文全体**を書く必要があります。既にCREATE POLICYが含まれている状態でさらにCREATE POLICYを書くとエラーになります。

> ⚠️ **セキュリティ注意**: 本番環境では、認証済みユーザーのみがアップロード・削除できるようにポリシーを変更してください。

---

## 4. RLSポリシーの設定

### 4.1 テーブルのRLSポリシー確認

1. 左メニューの「Authentication」→「Policies」をクリック
2. `store_visits` テーブルを選択
3. 既存のポリシーを確認

### 4.2 ポリシーの調整（必要に応じて）

開発環境では、既に `001_initial_schema.sql` で以下のポリシーが設定されています：

- 全ユーザーが読み書き可能（開発用）

本番環境では、認証を追加することを推奨します。

---

## 5. APIキーの取得

### 5.1 プロジェクト設定を開く

1. 左メニューの「Settings」（⚙️アイコン）をクリック
2. 「API」を選択

### 5.2 必要な情報をコピー

以下の2つの値をコピーしてメモしておきます：

1. **Project URL**
   - 例: `https://xxxxxxxxxxxxx.supabase.co`
   - → `.env` ファイルの `VITE_SUPABASE_URL` に設定

2. **anon public** key
   - 「Project API keys」セクションの `anon public` の値をコピー
   - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - → `.env` ファイルの `VITE_SUPABASE_ANON_KEY` に設定

> ⚠️ **重要**: `service_role` keyは**絶対に**フロントエンドで使用しないでください。サーバーサイドのみで使用します。

---

## 6. Gemini API（AI店舗検索）

AI店舗検索は、フロントエンドから Gemini API を呼び出します（`src/lib/gemini.ts`）。

1. [Google AI Studio](https://makersuite.google.com/app/apikey) で API キーを作成する。
2. ローカルでは `.env` に `VITE_GEMINI_API_KEY` を設定する。
3. **GitHub Pages** では、リポジトリの **Settings → Secrets and variables → Actions** に `VITE_GEMINI_API_KEY` を登録し、`.github/workflows/pages.yml` のビルドで注入されるようにする（未設定でもビルドは通るが、検索機能は動かない）。

> 公開サイトではキーがビルド成果物に含まれるため、Google Cloud 側でキーの制限（HTTP リファラー、API の制限など）を必ず行ってください。

---

## 7. 環境変数の設定

### 7.1 .envファイルの作成

プロジェクトルートに `.env` ファイルを作成：

```env
# Supabase設定
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini（AI店舗検索・オプション）
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 7.2 値の設定

1. **VITE_SUPABASE_URL**: 5.2でコピーしたProject URL
2. **VITE_SUPABASE_ANON_KEY**: 5.2でコピーしたanon public key
3. **VITE_GEMINI_API_KEY**: 6 で取得した API キー（任意）

> ⚠️ **注意**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

---

## 8. 動作確認

### 8.1 依存関係のインストール

```bash
cd bashotori
npm install
```

### 8.2 開発サーバーの起動

```bash
npm run dev
```

### 8.3 ブラウザで確認

1. `http://localhost:5173` を開く（Vite のデフォルト）
2. 以下の機能をテスト：

   ✅ **カレンダー表示**: 正常に表示されるか
   ✅ **新規登録**: フォームが開くか
   ✅ **データ保存**: Supabaseに保存されるか
   ✅ **画像アップロード**: Storageにアップロードされるか
   ✅ **AI検索**: `VITE_GEMINI_API_KEY` 設定時に動作するか

### 8.4 データベースの確認

1. Supabaseダッシュボードの「Table Editor」を開く
2. `store_visits` テーブルにデータが保存されているか確認

### 8.5 Storageの確認

1. Supabaseダッシュボードの「Storage」を開く
2. `store-visit-photos` バケットに画像がアップロードされているか確認

---

## 🔧 トラブルシューティング

### Supabase接続エラー

**エラー**: `Missing Supabase environment variables`

**解決方法**:
- `.env` ファイルが正しい場所にあるか確認
- 環境変数の値が正しいか確認
- 開発サーバーを再起動

### 画像アップロードエラー

**エラー**: `Error uploading image`

**解決方法**:
- Storageバケット名が `store-visit-photos` になっているか確認
- Storageポリシーが正しく設定されているか確認
- バケットが「Public」になっているか確認

### Gemini APIエラー

**エラー**: `Gemini API request failed`

**解決方法**:
- `VITE_GEMINI_API_KEY` が `.env` または GitHub Actions の Secrets に設定されているか確認
- API キーのクォータや制限（リファラー制限など）を確認

### CORSエラー

**エラー**: `Access to fetch blocked by CORS policy`

**解決方法**:
- Supabase の URL が認証・Storage の許可リストに含まれているか確認（[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) 参照）

---

## 📚 次のステップ

- [ ] 認証機能の追加（Supabase Auth）
- [ ] 本番環境のセキュリティ設定
- [ ] カスタムドメインの設定（GitHub Pages など）
- [ ] CI/CD（既存の `pages.yml`）の見直し

---

## 🔒 セキュリティチェックリスト

本番環境にデプロイする前に：

- [ ] RLSポリシーを認証済みユーザーのみに制限
- [ ] Storageポリシーを認証済みユーザーのみに制限
- [ ] 環境変数を環境ごとに分離
- [ ] ログから機密情報を除外
- [ ] レート制限を設定
- [ ] Gemini API キーに適切な制限を設定（公開フロントの場合は必須）

---

## 📞 サポート

問題が発生した場合：

1. Supabaseドキュメント: https://supabase.com/docs
2. プロジェクトのIssues: https://github.com/ShoheiAsogawa/BASHOTORI/issues
