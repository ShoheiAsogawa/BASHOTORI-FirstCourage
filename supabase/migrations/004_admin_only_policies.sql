-- 管理者のみが書き込み可能なポリシー（オプション）
-- このマイグレーションは、管理者のみがデータの作成・更新・削除を行えるようにします
-- リードオンリーユーザーは閲覧のみ可能です

-- ============================================
-- 1. store_visits テーブルの管理者専用ポリシー
-- ============================================

-- 既存の書き込みポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can insert" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can update" ON store_visits;
DROP POLICY IF EXISTS "Authenticated users can delete" ON store_visits;

-- 管理者のみ挿入可能
-- ユーザーメタデータのroleが'admin'の場合のみ許可
CREATE POLICY "Admins can insert"
ON store_visits FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 管理者のみ更新可能
CREATE POLICY "Admins can update"
ON store_visits FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete"
ON store_visits FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- ============================================
-- 2. Storage の管理者専用ポリシー
-- ============================================

-- 既存の書き込みポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 管理者のみアップロード可能
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

