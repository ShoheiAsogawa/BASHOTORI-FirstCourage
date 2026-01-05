-- store_visitsテーブルのポリシーを修正
-- user_rolesテーブルへの参照を削除し、user_metadataのみを使用

-- ============================================
-- 1. 既存のstore_visitsポリシーをすべて削除
-- ============================================

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

-- ============================================
-- 2. 新しいstore_visitsポリシー（user_metadataのみ使用）
-- ============================================

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

