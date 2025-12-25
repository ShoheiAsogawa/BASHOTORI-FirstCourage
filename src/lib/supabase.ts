import { createClient } from '@supabase/supabase-js';
import type { StoreVisit } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 店舗視察データの取得
export async function getStoreVisits(): Promise<StoreVisit[]> {
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
  const visitData = {
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
    const { data, error } = await supabase
      .from('store_visits')
      .update(visitData)
      .eq('id', visit.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating store visit:', error);
      throw error;
    }

    return transformStoreVisit(data);
  } else {
    // 新規作成
    const { data, error } = await supabase
      .from('store_visits')
      .insert(visitData)
      .select()
      .single();

    if (error) {
      console.error('Error creating store visit:', error);
      throw error;
    }

    return transformStoreVisit(data);
  }
}

// 店舗視察データの削除
export async function deleteStoreVisit(id: string): Promise<void> {
  const { error } = await supabase
    .from('store_visits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting store visit:', error);
    throw error;
  }
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
    judgment: row.judgment,
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

