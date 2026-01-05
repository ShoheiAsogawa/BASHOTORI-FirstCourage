-- Storageポリシーの無限再帰エラーを修正
-- user_rolesテーブルへの参照を削除し、user_metadataのみを使用

-- ============================================
-- 1. 既存のStorageポリシーをすべて削除
-- ============================================

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

-- ============================================
-- 2. 新しいStorageポリシー（user_metadataのみ使用）
-- ============================================

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

