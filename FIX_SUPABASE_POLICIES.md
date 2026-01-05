# Supabase RLSポリシー修正ガイド

## 問題

画像アップロード時に以下のエラーが発生：
```
infinite recursion detected in policy for relation "user_roles"
```

これは、RLSポリシーが`user_roles`テーブルを参照しようとして、循環参照が発生しているためです。

## 解決方法

`user_roles`テーブルへの参照を削除し、`user_metadata`のみを使用するようにポリシーを修正します。

---

## 修正手順

### ステップ1: Supabase SQL Editorを開く

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. 左メニュー → **「SQL Editor」**をクリック
4. **「New query」**をクリック

### ステップ2: Storageポリシーを修正

以下のSQLをコピーして実行してください：

```sql
-- Storageポリシーの無限再帰エラーを修正
-- user_rolesテーブルへの参照を削除し、user_metadataのみを使用

-- 既存のStorageポリシーをすべて削除
DROP POLICY IF EXISTS "Authenticated users can read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Readonly users can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- 新しいStorageポリシー（user_metadataのみ使用）
-- 認証済みユーザーは全員読み取り可能
CREATE POLICY "Storage: Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

-- 管理者のみアップロード可能（user_metadataから直接取得）
CREATE POLICY "Storage: Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
);

-- 管理者のみ削除可能（user_metadataから直接取得）
CREATE POLICY "Storage: Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
);
```

### ステップ3: store_visitsテーブルのポリシーを修正

以下のSQLをコピーして実行してください：

```sql
-- store_visitsテーブルのポリシーを修正
-- user_rolesテーブルへの参照を削除し、user_metadataのみを使用

-- 既存のstore_visitsポリシーをすべて削除
DROP POLICY IF EXISTS "Authenticated users can read all store_visits" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can insert store_visits" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can update own store_visits" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can delete own store_visits" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can read" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can insert" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can update" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can delete" ON store_visits;
DROP POLICY IF EXISTS "Readonly users can read store_visits" ON store_visits;
DROP POLICY IF EXISTS "Admins can insert store_visits" ON store_visits;
DROP POLICY IF EXISTS "Admins can update store_visits" ON store_visits;
DROP POLICY IF EXISTS "Admins can delete store_visits" ON store_visits;
DROP POLICY IF EXISTS "Admins can insert" ON store_visits;
DROP POLICY IF EXISTS "Admins can update" ON store_visits;
DROP POLICY IF EXISTS "Admins can delete" ON store_visits;

-- 新しいstore_visitsポリシー（user_metadataのみ使用）
-- 認証済みユーザーは全員読み取り可能
CREATE POLICY "Store visits: Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

-- 管理者のみ挿入可能
CREATE POLICY "Store visits: Admins can insert"
ON store_visits FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
);

-- 管理者のみ更新可能
CREATE POLICY "Store visits: Admins can update"
ON store_visits FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
);

-- 管理者のみ削除可能
CREATE POLICY "Store visits: Admins can delete"
ON store_visits FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'readonly') = 'admin'
);
```

---

## 確認方法

### 1. ポリシーが正しく設定されているか確認

1. Supabase Dashboard → **「Authentication」** → **「Policies」**
2. `store_visits`テーブルのポリシーを確認
3. `storage.objects`のポリシーを確認

### 2. アプリケーションで動作確認

1. アプリケーションにログイン（管理者アカウントで）
2. 新規登録を試す
3. 画像をアップロードしてみる
4. エラーが発生しないことを確認

---

## トラブルシューティング

### エラー: "policy already exists"

既存のポリシーが残っている可能性があります。以下のSQLで確認できます：

```sql
-- 既存のポリシーを確認
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('store_visits', 'objects');
```

### エラー: "permission denied"

SupabaseのSQL Editorで実行していることを確認してください。また、プロジェクトのオーナー権限があることを確認してください。

### まだエラーが発生する場合

1. ブラウザのキャッシュをクリア
2. アプリケーションを再読み込み
3. 再度ログインして試す

---

## 変更内容の説明

### 修正前の問題

- `user_roles`テーブルを参照するポリシーが存在していた
- そのテーブル自体がRLSで保護されている場合、循環参照が発生

### 修正後

- `user_metadata`のみを使用（JWTトークンから直接取得）
- `COALESCE`を使用して、`role`が設定されていない場合は`'readonly'`をデフォルトとする
- 循環参照を完全に排除

---

**次のステップ**: SQLを実行した後、アプリケーションで画像アップロードとデータ保存を試してください。

