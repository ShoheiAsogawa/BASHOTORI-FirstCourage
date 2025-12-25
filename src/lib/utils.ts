import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付をフォーマット（YYYY-MM-DD）
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

// 日付を日本語形式でフォーマット
export function formatDateJP(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年M月d日', { locale: ja });
}

// UUID生成
export function generateId(): string {
  return crypto.randomUUID();
}

