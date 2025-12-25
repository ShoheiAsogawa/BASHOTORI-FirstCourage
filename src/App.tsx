import { Routes, Route } from 'react-router-dom';
import CalendarView from './pages/CalendarView';
import DashboardView from './pages/DashboardView';
import StoreSearchView from './pages/StoreSearchView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CalendarView />} />
      <Route path="/dashboard" element={<DashboardView />} />
      <Route path="/search" element={<StoreSearchView />} />
    </Routes>
  );
}

export default App;

