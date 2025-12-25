import { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { RANKS, JUDGMENT } from '../lib/constants';
import type { StoreVisit } from '../types';

interface DashboardProps {
  visits: StoreVisit[];
  currentDate: Date;
  onGetAdvice: (stats: any) => void;
  adviceLoading: boolean;
  adviceResult: string;
}

export function Dashboard({
  visits,
  currentDate,
  onGetAdvice,
  adviceLoading,
  adviceResult,
}: DashboardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const stats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const yearVisits = visits.filter((v) => new Date(v.date).getFullYear() === year);
    const yearTotal = yearVisits.length;
    const yearHot = yearVisits.filter((v) =>
      ['S', 'A'].includes(v.rank) && ['approved', 'negotiating'].includes(v.judgment)
    ).length;

    const monthVisits = yearVisits.filter((v) => new Date(v.date).getMonth() === month);
    const monthTotal = monthVisits.length;
    const monthHot = monthVisits.filter((v) =>
      ['S', 'A'].includes(v.rank) && ['approved', 'negotiating'].includes(v.judgment)
    ).length;

    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthVisits = visits.filter((v) => {
      const d = new Date(v.date);
      return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
    });
    const monthDiff = monthTotal - prevMonthVisits.length;
    const diffSign = monthDiff > 0 ? '+' : '';

    const byRank: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 };
    monthVisits.forEach((v) => {
      if (byRank[v.rank] !== undefined) byRank[v.rank]++;
    });
    const byJudgment: Record<string, number> = {
      approved: 0,
      negotiating: 0,
      pending: 0,
      rejected: 0,
    };
    monthVisits.forEach((v) => {
      if (byJudgment[v.judgment] !== undefined) byJudgment[v.judgment]++;
    });

    return {
      year,
      month: month + 1,
      yearTotal,
      yearHot,
      monthTotal,
      monthHot,
      monthDiff,
      diffSign,
      byRank,
      byJudgment,
    };
  }, [visits, currentDate]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div
        className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
              <Icon name="Briefcase" size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                {stats.year}年 年間累計
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {stats.yearTotal}
                  <span className="text-sm font-normal text-slate-400 ml-1">件</span>
                </span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  SorA {stats.yearHot}件
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-slate-200"></div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Icon name="Calendar" size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                {stats.month}月 月間実績
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {stats.monthTotal}
                  <span className="text-sm font-normal text-slate-400 ml-1">件</span>
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    stats.monthDiff >= 0
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-red-500 bg-red-50'
                  }`}
                >
                  前月比 {stats.diffSign}
                  {stats.monthDiff}件
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block text-slate-400 bg-slate-100 p-2 rounded-full mt-4 md:mt-0">
          {isOpen ? <Icon name="ChevronUp" size={18} /> : <Icon name="ChevronDown" size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">
                {stats.month}月 ランク内訳
              </h5>
              <div className="space-y-3">
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-200">
                  {Object.keys(RANKS).map((r) => {
                    const count = stats.byRank[r];
                    const pct = stats.monthTotal > 0 ? (count / stats.monthTotal) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={r}
                        style={{ width: `${pct}%` }}
                        className={`${RANKS[r].dot} transition-all duration-500 border-r border-white/20 last:border-0`}
                      />
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(RANKS).map((r) => (
                    <div
                      key={r}
                      className="flex items-center justify-between bg-white p-2 rounded border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${RANKS[r].dot}`} />
                        <span className="text-xs font-bold text-slate-600">{r}ランク</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{stats.byRank[r]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">
                {stats.month}月 判定状況
              </h5>
              <div className="space-y-3">
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-200">
                  {Object.entries(JUDGMENT).map(([k, info]) => {
                    const count = stats.byJudgment[k];
                    const pct = stats.monthTotal > 0 ? (count / stats.monthTotal) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={k}
                        style={{ width: `${pct}%` }}
                        className={`${info.dot} transition-all duration-500 border-r border-white/20 last:border-0`}
                      />
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(JUDGMENT).map(([k, info]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={info.icon} size={14} className={info.color.split(' ')[0]} />
                        <span className="text-[10px] font-bold text-slate-500">{info.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-700">{stats.byJudgment[k]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
              <Icon name="Sparkles" size={14} /> AI営業アドバイス
            </h5>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 min-h-[60px] flex items-center">
                  {adviceResult ? (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {adviceResult}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs w-full text-center sm:text-left">
                      今月のデータに基づいた<br className="sm:hidden" />
                      アドバイスを生成します
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetAdvice(stats);
                  }}
                  disabled={adviceLoading}
                  className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-2"
                >
                  {adviceLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>生成中...</span>
                    </div>
                  ) : (
                    <>アドバイスをもらう</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

