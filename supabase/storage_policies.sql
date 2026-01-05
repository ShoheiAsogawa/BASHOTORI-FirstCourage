-- Storageポリシー設定用SQL
-- このファイルの内容をSupabaseのSQL Editorで実行してください

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

