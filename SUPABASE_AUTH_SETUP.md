# Supabase認証設定ガイド

このガイドでは、BASHOTORIアプリケーションの認証機能を設定する方法を説明します。

## 目次

1. [Supabase認証の有効化](#1-supabase認証の有効化)
2. [ユーザーの手動作成](#2-ユーザーの手動作成)
3. [読み取り専用と管理者の区別](#3-読み取り専用と管理者の区別)
4. [RLSポリシーの設定](#4-rlsポリシーの設定)
5. [Storageポリシーの設定](#5-storageポリシーの設定)

---

## 1. Supabase認証の有効化

### 1.1 Authentication設定を開く

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左メニューの「Authentication」をクリック

### 1.2 Email認証の確認

1. 「Providers」タブを開く
2. 「Email」プロバイダーが有効になっていることを確認
3. 必要に応じて「Enable Email Provider」をクリック

### 1.3 認証設定の確認

「Settings」タブで以下を確認：

- **Site URL**: アプリケーションのURL（例: `http://localhost:5173`）
- **Redirect URLs**: リダイレクト先URL（例: `http://localhost:5173/**`）

---

## 2. ユーザーの手動作成

### 2.1 Supabase Dashboardから作成

1. 「Authentication」→「Users」タブを開く
2. 「Add user」ボタンをクリック
3. 以下の情報を入力：
   - **Email**: ユーザーのメールアドレス
   - **Password**: パスワード（8文字以上推奨）
   - **Auto Confirm User**: ✅ チェック（メール確認をスキップ）
4. 「Create user」をクリック

### 2.2 ユーザーメタデータの設定（オプション）

ユーザー作成後、ユーザーをクリックして「User Metadata」に以下を追加：

```json
{
  "role": "readonly"  // または "admin"
}
```

または、SQLで直接設定：

```sql
-- ユーザーのメタデータを更新
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'readonly')
WHERE email = 'readonly@example.com';  -- 読み取り専用ユーザー

UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'admin@example.com';
```

---

## 3. 読み取り専用と管理者の区別

### 3.1 方法1: ユーザーメタデータを使用（推奨）

アプリケーション側でユーザーのロールを確認：

```typescript
// src/lib/auth.ts などに追加
export async function getUserRole(): Promise<'readonly' | 'admin' | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return user.user_metadata?.role || 'readonly';
}
```

### 3.2 方法2: カスタムテーブルを使用

ユーザー情報を管理するテーブルを作成：

```sql
-- ユーザーロール管理テーブル
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('readonly', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLSを有効化
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のロールを確認可能
CREATE POLICY "Users can view their own role"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 管理者は全ユーザーのロールを確認可能
CREATE POLICY "Admins can view all roles"
ON user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## 4. RLSポリシーの設定

### 4.1 store_visitsテーブルのポリシー

既存のポリシーを削除して、認証済みユーザー向けに設定：

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

-- 認証済みユーザーは全員読み取り可能
CREATE POLICY "Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

-- 管理者のみ挿入可能
CREATE POLICY "Admins can insert"
ON store_visits FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    -- メタデータでロールを確認
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    -- またはカスタムテーブルでロールを確認
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 管理者のみ更新可能
CREATE POLICY "Admins can update"
ON store_visits FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete"
ON store_visits FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);
```

### 4.2 シンプルな設定（開発用）

開発環境では、すべての認証済みユーザーに読み書き権限を付与：

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

-- 認証済みユーザーは全員読み書き可能
CREATE POLICY "Authenticated users can do all"
ON store_visits FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

---

## 5. Storageポリシーの設定

### 5.1 認証済みユーザー向けポリシー

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- 認証済みユーザーは全員読み取り可能
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

-- 管理者のみアップロード可能
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);
```

### 5.2 シンプルな設定（開発用）

```sql
-- 認証済みユーザーは全員読み書き可能
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);
```

---

## 6. マイグレーションファイルの作成

設定をマイグレーションファイルとして保存：

```bash
# supabase/migrations/003_auth_setup.sql を作成
```

ファイル内容：

```sql
-- 認証済みユーザー向けRLSポリシー
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

CREATE POLICY "Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert"
ON store_visits FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update"
ON store_visits FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete"
ON store_visits FOR DELETE
USING (auth.role() = 'authenticated');

-- Storageポリシー
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);
```

---

## 7. テスト手順

### 7.1 ユーザー作成のテスト

1. Supabase Dashboardでユーザーを作成
2. アプリケーションでログインを試す
3. データの読み取りができることを確認

### 7.2 権限のテスト

1. 読み取り専用ユーザーでログイン
2. データの閲覧ができることを確認
3. 新規登録・編集・削除ができないことを確認（管理者のみ可能な場合）
4. 管理者ユーザーでログイン
5. 新規登録・編集・削除ができることを確認

---

## 8. トラブルシューティング

### 8.1 ログインできない

- メールアドレスとパスワードが正しいか確認
- Supabase Dashboardでユーザーが作成されているか確認
- 「Auto Confirm User」が有効になっているか確認

### 8.2 データにアクセスできない

- RLSポリシーが正しく設定されているか確認
- ユーザーが認証されているか確認（`auth.role() = 'authenticated'`）

### 8.3 画像をアップロードできない

- Storageポリシーが正しく設定されているか確認
- バケット名が `store-visit-photos` であることを確認

---

## 9. セキュリティのベストプラクティス

1. **強力なパスワード**: ユーザーには強力なパスワードを設定
2. **定期的な確認**: 定期的にユーザーリストを確認し、不要なアカウントを削除
3. **ログの監視**: Supabase Dashboardで認証ログを確認
4. **環境変数の保護**: `.env`ファイルをGitにコミットしない

---

以上でSupabase認証の設定は完了です。

