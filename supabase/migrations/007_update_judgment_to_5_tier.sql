-- 最終判定を5段階（S, A, B, C, D）に変更するマイグレーション

-- 既存のCHECK制約を削除
ALTER TABLE store_visits DROP CONSTRAINT IF EXISTS store_visits_judgment_check;

-- 既存データの移行: pending/negotiating/approved → S/A/B, rejected → D
UPDATE store_visits 
SET judgment = CASE 
  WHEN judgment = 'approved' THEN 'S'
  WHEN judgment = 'negotiating' THEN 'A'
  WHEN judgment = 'pending' THEN 'B'
  WHEN judgment = 'rejected' THEN 'D'
  ELSE 'B'  -- デフォルト値
END;

-- 新しいCHECK制約を追加（S, A, B, C, D）
ALTER TABLE store_visits 
ADD CONSTRAINT store_visits_judgment_check 
CHECK (judgment IN ('S', 'A', 'B', 'C', 'D'));

