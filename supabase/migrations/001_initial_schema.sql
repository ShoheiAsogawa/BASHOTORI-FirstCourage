-- BASHOTORI データベーススキーマ

-- 店舗視察テーブル
CREATE TABLE IF NOT EXISTS store_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  facility_name TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  prefecture TEXT,
  rank TEXT NOT NULL CHECK (rank IN ('S', 'A', 'B', 'C')),
  judgment TEXT NOT NULL CHECK (judgment IN ('pending', 'negotiating', 'approved', 'rejected')),
  
  -- 環境・設備
  environment TEXT NOT NULL CHECK (environment IN ('屋内', '半屋内', '屋外')),
  imitation_table TEXT NOT NULL CHECK (imitation_table IN ('設置可', '条件付', '不可')),
  register_count TEXT CHECK (register_count IN ('1-3台', '4-6台', '7台以上')),
  space_size TEXT CHECK (space_size IN ('小さい', '普通', '広い')),
  space_size_note TEXT,
  
  -- 客層・動線
  traffic_count TEXT CHECK (traffic_count IN ('少ない', '普通', '多い')),
  traffic_count_note TEXT,
  demographics JSONB, -- CustomerSegment[] の配列
  demographics_note TEXT,
  flow_line TEXT CHECK (flow_line IN ('◎', '⚪︎', '△')),
  flow_line_note TEXT,
  
  -- 運営・条件
  competitors TEXT CHECK (competitors IN ('無し', '1店舗', '2店舗', '3店舗以上')),
  competitors_note TEXT,
  staff_count TEXT CHECK (staff_count IN ('1人', '2人', '3人')),
  seasonality TEXT CHECK (seasonality IN ('春秋ならok', 'オールシーズンok')),
  busy_day TEXT CHECK (busy_day IN ('土日祝', '何曜日でもok')),
  busy_day_note TEXT,
  
  -- その他
  overall_review TEXT,
  conditions TEXT,
  photo_url TEXT, -- JSON string of Photo[]
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_store_visits_date ON store_visits(date);
CREATE INDEX IF NOT EXISTS idx_store_visits_rank ON store_visits(rank);
CREATE INDEX IF NOT EXISTS idx_store_visits_judgment ON store_visits(judgment);
CREATE INDEX IF NOT EXISTS idx_store_visits_prefecture ON store_visits(prefecture);
CREATE INDEX IF NOT EXISTS idx_store_visits_facility_name ON store_visits(facility_name);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_visits_updated_at
  BEFORE UPDATE ON store_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) の設定
ALTER TABLE store_visits ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書き可能（必要に応じて認証を追加）
CREATE POLICY "Allow all operations for authenticated users"
  ON store_visits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 匿名ユーザーも読み書き可能（開発用、本番では削除推奨）
CREATE POLICY "Allow all operations for anonymous users"
  ON store_visits
  FOR ALL
  USING (true)
  WITH CHECK (true);

