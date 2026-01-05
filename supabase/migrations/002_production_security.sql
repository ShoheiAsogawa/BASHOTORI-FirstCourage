-- 本番環境用セキュリティ設定
-- 認証済みユーザーのみアクセス可能にする

-- ============================================
-- 1. store_visits テーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON store_visits;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON store_visits;

-- 認証済みユーザーのみ読み取り可能
CREATE POLICY "Authenticated users can read"
ON store_visits FOR SELECT
USING (auth.role() = 'authenticated');

-- 認証済みユーザーのみ挿入可能
CREATE POLICY "Authenticated users can insert"
ON store_visits FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 認証済みユーザーのみ更新可能
CREATE POLICY "Authenticated users can update"
ON store_visits FOR UPDATE
USING (auth.role() = 'authenticated');

-- 認証済みユーザーのみ削除可能
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

-- 認証済みユーザーのみ読み取り可能
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');

-- 認証済みユーザーのみ削除可能
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos' AND auth.role() = 'authenticated');

-- ============================================
-- 注意事項
-- ============================================
-- 
-- このマイグレーションを実行する前に：
-- 1. Supabase Authが有効になっていることを確認
-- 2. フロントエンドで認証機能が実装されていることを確認
-- 3. 開発環境では、このマイグレーションを実行しないでください
--    （開発環境では匿名アクセスが必要な場合があります）
--
-- 開発環境に戻す場合：
-- supabase/migrations/001_initial_schema.sql のRLSポリシーを再実行してください

