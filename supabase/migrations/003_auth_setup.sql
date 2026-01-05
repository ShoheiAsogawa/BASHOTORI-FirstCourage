-- 認証機能のセットアップ
-- このマイグレーションは認証済みユーザー向けのRLSポリシーを設定します

-- ============================================
-- 1. store_visits テーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

-- 認証済みユーザーは全員読み取り可能
CREATE POLICY "Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

-- 認証済みユーザーは全員挿入可能
-- 注意: 管理者のみに制限する場合は、このポリシーを削除して
-- 管理者専用のポリシーを作成してください
CREATE POLICY "Authenticated users can insert"
ON store_visits FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 認証済みユーザーは全員更新可能
-- 注意: 管理者のみに制限する場合は、このポリシーを削除して
-- 管理者専用のポリシーを作成してください
CREATE POLICY "Authenticated users can update"
ON store_visits FOR UPDATE
USING (auth.role() = 'authenticated');

-- 認証済みユーザーは全員削除可能
-- 注意: 管理者のみに制限する場合は、このポリシーを削除して
-- 管理者専用のポリシーを作成してください
CREATE POLICY "Authenticated users can delete"
ON store_visits FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- 2. Storage ポリシー
-- ============================================

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

-- 認証済みユーザーは全員アップロード可能
-- 注意: 管理者のみに制限する場合は、このポリシーを削除して
-- 管理者専用のポリシーを作成してください
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーは全員削除可能
-- 注意: 管理者のみに制限する場合は、このポリシーを削除して
-- 管理者専用のポリシーを作成してください
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-visit-photos' AND
  auth.role() = 'authenticated'
);

