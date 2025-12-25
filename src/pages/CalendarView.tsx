import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Icon } from '../components/Icon';
import { Calendar } from '../components/Calendar';
import { Dashboard } from '../components/Dashboard';
import { StoreFormModal } from '../components/StoreFormModal';
import { DayDetailModal } from '../components/DayDetailModal';
import { getStoreVisits, saveStoreVisit, deleteStoreVisit } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import type { StoreVisit } from '../types';

export default function CalendarView() {
  const [visits, setVisits] = useState<StoreVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [editingVisit, setEditingVisit] = useState<StoreVisit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [filterJudgment, setFilterJudgment] = useState<string>('ALL');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getStoreVisits();
      setVisits(data);
    } catch (e) {
      console.error('Load Error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<StoreVisit>) => {
    setLoading(true);
    try {
      const saved = await saveStoreVisit(data);
      await loadData();
      setIsFormOpen(false);
      setEditingVisit(null);
    } catch (e) {
      alert('保存エラー: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この視察記録を削除しますか？')) {
      return;
    }
    try {
      await deleteStoreVisit(id);
      await loadData();
    } catch (e) {
      alert('削除エラー: ' + (e as Error).message);
    }
  };

  const handleGetAdvice = async (stats: any) => {
    setAdviceLoading(true);
    setAdviceResult('');
    // TODO: Gemini API呼び出し
    setTimeout(() => {
      setAdviceResult('今月の実績を踏まえ、優先順位をつけてフォローアップを強化しましょう。');
      setAdviceLoading(false);
    }, 1000);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchesSearch =
        v.facilityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRank = filterRank === 'ALL' || v.rank === filterRank;
      const matchesJudgment = filterJudgment === 'ALL' || v.judgment === filterJudgment;
      return matchesSearch && matchesRank && matchesJudgment;
    });
  }, [visits, searchTerm, filterRank, filterJudgment]);

  const getDayVisits = (d: Date) => {
    if (!d) return [];
    const str = formatDate(d);
    return filteredVisits.filter((v) => v.date === str);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-4 sm:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Dashboard
                visits={visits}
                currentDate={currentDate}
                onGetAdvice={handleGetAdvice}
                adviceLoading={adviceLoading}
                adviceResult={adviceResult}
              />
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="Search" size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="施設・担当者で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRank}
                    onChange={(e) => setFilterRank(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2.5 outline-none focus:border-orange-500 font-bold text-slate-600 w-full sm:w-auto"
                  >
                    <option value="ALL">全ランク</option>
                    <option value="S">S</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  <select
                    value={filterJudgment}
                    onChange={(e) => setFilterJudgment(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2.5 outline-none focus:border-orange-500 font-bold text-slate-600 w-full sm:w-auto"
                  >
                    <option value="ALL">全判定</option>
                    <option value="pending">調査中</option>
                    <option value="negotiating">交渉中</option>
                    <option value="approved">出店可</option>
                    <option value="rejected">不可/NG</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white p-3 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full">
                <h2 className="text-xl lg:text-3xl font-bold text-slate-800 mb-3 lg:mb-6">
                  {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                    }
                    className="p-2 lg:p-4 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-2xl transition"
                  >
                    <Icon name="ChevronLeft" size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 lg:px-6 lg:py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition text-sm"
                  >
                    今日
                  </button>
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                    }
                    className="p-2 lg:p-4 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-2xl transition"
                  >
                    <Icon name="ChevronRight" size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditingVisit(null);
                setIsFormOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition active:scale-95 flex items-center gap-2"
            >
              <Icon name="Plus" size={18} /> 新規登録
            </button>
          </div>

          <Calendar
            currentDate={currentDate}
            visits={filteredVisits}
            onDateClick={(date) => setSelectedDateObj(date)}
            onAddClick={(date) => {
              setEditingVisit(null);
              setSelectedDateObj(date);
              setIsFormOpen(true);
            }}
          />
        </div>
      </main>

      <DayDetailModal
        dateObj={selectedDateObj}
        visits={selectedDateObj ? getDayVisits(selectedDateObj) : []}
        onClose={() => setSelectedDateObj(null)}
        onAdd={() => {
          setIsFormOpen(true);
          setEditingVisit(null);
        }}
        onEdit={(v) => {
          setIsFormOpen(true);
          setEditingVisit(v);
        }}
        onDelete={handleDelete}
      />

      {isFormOpen && (
        <StoreFormModal
          initialData={editingVisit}
          selectedDate={selectedDateObj}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVisit(null);
          }}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </div>
  );
}

