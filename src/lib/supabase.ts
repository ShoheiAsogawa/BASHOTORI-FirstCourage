import { createClient } from '@supabase/supabase-js';
import type { StoreVisit } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// デバッグ用：環境変数の確認
console.log('Supabase環境変数チェック:', {
  url: supabaseUrl ? '✓ 設定済み' : '✗ 未設定',
  key: supabaseAnonKey ? '✓ 設定済み' : '✗ 未設定',
  urlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'undefined',
});

// Supabaseクライアントの初期化
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Supabase client initialization error:', error);
  }
} else {
  console.error('❌ Supabase環境変数が設定されていません。');
  console.error('   .envファイルを確認し、開発サーバーを再起動してください。');
  console.error('   必要な環境変数:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
}

export { supabase };

// 店舗視察データの取得
export async function getStoreVisits(): Promise<StoreVisit[]> {
  if (!supabase) {
    console.warn('Supabase client is not initialized');
    return [];
  }
  const { data, error } = await supabase
    .from('store_visits')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching store visits:', error);
    throw error;
  }

  return data.map(transformStoreVisit);
}

// 店舗視察データの保存
export async function saveStoreVisit(visit: Partial<StoreVisit>): Promise<StoreVisit> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }
  
  // Supabaseクライアントを確実に取得
  const client = supabase;
  
  const visitData: Record<string, any> = {
    date: visit.date,
    facility_name: visit.facilityName,
    staff_name: visit.staffName,
    prefecture: visit.prefecture,
    rank: visit.rank,
    judgment: visit.judgment,
    environment: visit.environment,
    imitation_table: visit.imitationTable,
    register_count: visit.registerCount,
    space_size: visit.spaceSize,
    space_size_note: visit.spaceSizeNote,
    traffic_count: visit.trafficCount,
    traffic_count_note: visit.trafficCountNote,
    demographics: visit.demographics || null,
    demographics_note: visit.demographicsNote,
    flow_line: visit.flowLine,
    flow_line_note: visit.flowLineNote,
    competitors: visit.competitors,
    competitors_note: visit.competitorsNote,
    staff_count: visit.staffCount,
    seasonality: visit.seasonality,
    busy_day: visit.busyDay,
    busy_day_note: visit.busyDayNote,
    overall_review: visit.overallReview,
    conditions: visit.conditions,
    photo_url: visit.photoUrl,
  };

  if (visit.id) {
    // 更新
    const result: any = await (client as any)
      .from('store_visits')
      .update(visitData)
      .eq('id', visit.id)
      .select()
      .single();
    
    const { data, error } = result;

    if (error) {
      console.error('Error updating store visit:', error);
      throw error;
    }

    return transformStoreVisit(data);
  } else {
    // 新規作成
    const result: any = await (client as any)
      .from('store_visits')
      .insert(visitData)
      .select()
      .single();
    
    const { data, error } = result;

    if (error) {
      console.error('Error creating store visit:', error);
      throw error;
    }

    return transformStoreVisit(data);
  }
}

// 店舗視察データの削除
export async function deleteStoreVisit(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }
  const { error } = await supabase
    .from('store_visits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting store visit:', error);
    throw error;
  }
}

// 古い判定値を新しい値に変換
function normalizeJudgment(judgment: string): 'S' | 'A' | 'B' | 'C' | 'D' {
  // 既に新しい値の場合はそのまま返す
  if (['S', 'A', 'B', 'C', 'D'].includes(judgment)) {
    return judgment as 'S' | 'A' | 'B' | 'C' | 'D';
  }
  // 古い値を新しい値に変換
  const mapping: Record<string, 'S' | 'A' | 'B' | 'C' | 'D'> = {
    'approved': 'S',
    'negotiating': 'A',
    'pending': 'B',
    'rejected': 'D',
  };
  return mapping[judgment] || 'B'; // デフォルトはB
}

// データベースのスネークケースをキャメルケースに変換
function transformStoreVisit(row: any): StoreVisit {
  return {
    id: row.id,
    date: row.date,
    facilityName: row.facility_name,
    staffName: row.staff_name,
    prefecture: row.prefecture,
    rank: row.rank,
    judgment: normalizeJudgment(row.judgment),
    environment: row.environment,
    imitationTable: row.imitation_table,
    registerCount: row.register_count,
    spaceSize: row.space_size,
    spaceSizeNote: row.space_size_note,
    trafficCount: row.traffic_count,
    trafficCountNote: row.traffic_count_note,
    demographics: row.demographics || undefined,
    demographicsNote: row.demographics_note,
    flowLine: row.flow_line,
    flowLineNote: row.flow_line_note,
    competitors: row.competitors,
    competitorsNote: row.competitors_note,
    staffCount: row.staff_count,
    seasonality: row.seasonality,
    busyDay: row.busy_day,
    busyDayNote: row.busy_day_note,
    overallReview: row.overall_review,
    conditions: row.conditions,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

