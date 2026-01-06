// リクエスト制限管理（ローカルストレージ使用）

const STORAGE_KEY = 'store_search_requests';
const DAILY_LIMIT = 10; // 1日あたりのリクエスト制限（無料枠対応）

interface RequestRecord {
  date: string;
  count: number;
}

export function checkRateLimit(): { allowed: boolean; remaining: number; limit: number } {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
  const stored = localStorage.getItem(STORAGE_KEY);
  
  let records: RequestRecord[] = [];
  if (stored) {
    try {
      records = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse rate limit data:', e);
      records = [];
    }
  }

  // 今日のレコードを探す
  const todayRecord = records.find(r => r.date === today);
  
  if (todayRecord) {
    const remaining = Math.max(0, DAILY_LIMIT - todayRecord.count);
    return {
      allowed: todayRecord.count < DAILY_LIMIT,
      remaining,
      limit: DAILY_LIMIT
    };
  }

  // 今日のレコードがない場合は新規作成
  return {
    allowed: true,
    remaining: DAILY_LIMIT,
    limit: DAILY_LIMIT
  };
}

export function incrementRequestCount(): void {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  
  let records: RequestRecord[] = [];
  if (stored) {
    try {
      records = JSON.parse(stored);
    } catch (e) {
      records = [];
    }
  }

  // 古いレコードを削除（30日以上前）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  records = records.filter(r => r.date >= thirtyDaysAgo.toISOString().split('T')[0]);

  // 今日のレコードを探す
  const todayRecord = records.find(r => r.date === today);
  
  if (todayRecord) {
    todayRecord.count += 1;
  } else {
    records.push({ date: today, count: 1 });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRateLimitInfo(): { remaining: number; limit: number; resetDate: string } {
  const { remaining, limit } = checkRateLimit();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    remaining,
    limit,
    resetDate: tomorrow.toISOString()
  };
}

