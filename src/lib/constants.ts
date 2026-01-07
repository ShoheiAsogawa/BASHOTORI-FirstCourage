import type { RankInfo, JudgmentInfo } from '@/types';

export const RANKS: Record<string, RankInfo> = {
  S: {
    label: 'S (即決)',
    desc: '超優良',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500',
    hoverBg: 'hover:bg-orange-50',
    activeBg: 'bg-orange-100',
  },
  A: {
    label: 'A (優良)',
    desc: '期待大',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    ring: 'ring-yellow-500',
    hoverBg: 'hover:bg-yellow-50',
    activeBg: 'bg-yellow-100',
  },
  B: {
    label: 'B (検討)',
    desc: '標準',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500',
    hoverBg: 'hover:bg-blue-50',
    activeBg: 'bg-blue-50',
  },
  C: {
    label: 'C (見送り)',
    desc: '厳しい',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    ring: 'ring-slate-400',
    hoverBg: 'hover:bg-slate-50',
    activeBg: 'bg-slate-100',
  },
};

export const JUDGMENT: Record<string, JudgmentInfo> = {
  S: {
    label: 'S（超優良）',
    color: 'text-orange-600 bg-orange-100',
    icon: 'Star',
    border: 'border-orange-200',
    hoverBg: 'hover:bg-orange-50',
    activeBg: 'bg-orange-100',
    dot: 'bg-orange-500',
  },
  A: {
    label: 'A（期待大）',
    color: 'text-yellow-600 bg-yellow-100',
    icon: 'Star',
    border: 'border-yellow-200',
    hoverBg: 'hover:bg-yellow-50',
    activeBg: 'bg-yellow-100',
    dot: 'bg-yellow-500',
  },
  B: {
    label: 'B（標準）',
    color: 'text-blue-600 bg-blue-100',
    icon: 'Circle',
    border: 'border-blue-200',
    hoverBg: 'hover:bg-blue-50',
    activeBg: 'bg-blue-100',
    dot: 'bg-blue-500',
  },
  C: {
    label: 'C（検討）',
    color: 'text-slate-600 bg-slate-100',
    icon: 'Circle',
    border: 'border-slate-200',
    hoverBg: 'hover:bg-slate-50',
    activeBg: 'bg-slate-100',
    dot: 'bg-slate-400',
  },
  D: {
    label: 'D（厳しい）',
    color: 'text-red-600 bg-red-100',
    icon: 'X',
    border: 'border-red-200',
    hoverBg: 'hover:bg-red-50',
    activeBg: 'bg-red-100',
    dot: 'bg-red-400',
  },
};

export const ENVIRONMENTS = ['屋内', '半屋内', '屋外'] as const;
export const IMITATIONS = ['設置可', '条件付', '不可'] as const;
export const REGISTER_COUNTS = ['1-3台', '4-6台', '7台以上'] as const;
export const COMPETITOR_COUNTS = ['無し', '1店舗', '2店舗', '3店舗以上'] as const;
export const TRAFFIC_LEVELS = ['少ない', '普通', '多い'] as const;
export const CUSTOMER_SEGMENTS = [
  'ファミリー層',
  'ラグジュアリー層',
  'シニア層',
  '主婦層',
  '女性多め',
  '男性多め',
] as const;
export const FLOW_LINE_RATINGS = ['◎', '⚪︎', '△'] as const;
export const SEASONALITY_OPTIONS = ['春秋ならok', 'オールシーズンok'] as const;
export const BUSY_DAY_OPTIONS = ['土日祝', '何曜日でもok'] as const;
export const STAFF_COUNTS = ['1人', '2人', '3人'] as const;
export const SPACE_SIZES = ['小さい', '普通', '広い'] as const;

