import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CalendarView from './pages/CalendarView';
import DashboardView from './pages/DashboardView';
import StoreSearchView from './pages/StoreSearchView';
import LoginView from './pages/LoginView';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態の確認
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginView
              onLoginSuccess={() => {
                // ログイン成功時の処理はonAuthStateChangeで自動的に処理される
              }}
            />
          )
        }
      />
      <Route
        path="/*"
        element={
          user ? (
            <>
              <Routes>
                <Route path="/" element={<CalendarView />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/search" element={<StoreSearchView />} />
              </Routes>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;

