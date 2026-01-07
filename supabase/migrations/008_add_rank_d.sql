-- ポテンシャルランクにDを追加するマイグレーション

-- 既存のCHECK制約を削除
ALTER TABLE store_visits DROP CONSTRAINT IF EXISTS store_visits_rank_check;

-- 新しいCHECK制約を追加（S, A, B, C, D）
ALTER TABLE store_visits 
ADD CONSTRAINT store_visits_rank_check 
CHECK (rank IN ('S', 'A', 'B', 'C', 'D'));

