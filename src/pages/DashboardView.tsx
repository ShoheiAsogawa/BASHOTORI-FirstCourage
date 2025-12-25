import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../components/Dashboard';
import { getStoreVisits } from '../lib/supabase';
import type { StoreVisit } from '../types';

export default function DashboardView() {
  const [visits, setVisits] = useState<StoreVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const handleGetAdvice = async (stats: any) => {
    setAdviceLoading(true);
    setAdviceResult('');
    // TODO: Gemini API呼び出し
    setTimeout(() => {
      setAdviceResult('今月の実績を踏まえ、優先順位をつけてフォローアップを強化しましょう。');
      setAdviceLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-4 sm:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <Dashboard
            visits={visits}
            currentDate={currentDate}
            onGetAdvice={handleGetAdvice}
            adviceLoading={adviceLoading}
            adviceResult={adviceResult}
          />
        </div>
      </main>
    </div>
  );
}

