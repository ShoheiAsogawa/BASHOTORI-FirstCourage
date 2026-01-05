import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../components/Dashboard';
import { getStoreVisits } from '../lib/supabase';
import type { StoreVisit } from '../types';

export default function DashboardView() {
  const [visits, setVisits] = useState<StoreVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [appliedFilterRank, setAppliedFilterRank] = useState<string>('ALL');
  const [filterJudgment, setFilterJudgment] = useState<string>('ALL');
  const [appliedFilterJudgment, setAppliedFilterJudgment] = useState<string>('ALL');
  const [filterPrefecture, setFilterPrefecture] = useState<string>('ALL');
  const [appliedFilterPrefecture, setAppliedFilterPrefecture] = useState<string>('ALL');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('ALL');
  const [appliedFilterEnvironment, setAppliedFilterEnvironment] = useState<string>('ALL');
  const [filterRegisterCount, setFilterRegisterCount] = useState<string>('ALL');
  const [appliedFilterRegisterCount, setAppliedFilterRegisterCount] = useState<string>('ALL');
  const [filterTrafficCount, setFilterTrafficCount] = useState<string>('ALL');
  const [appliedFilterTrafficCount, setAppliedFilterTrafficCount] = useState<string>('ALL');
  const [filterSeasonality, setFilterSeasonality] = useState<string>('ALL');
  const [appliedFilterSeasonality, setAppliedFilterSeasonality] = useState<string>('ALL');
  const [filterBusyDay, setFilterBusyDay] = useState<string>('ALL');
  const [appliedFilterBusyDay, setAppliedFilterBusyDay] = useState<string>('ALL');
  const [filterStaffCount, setFilterStaffCount] = useState<string>('ALL');
  const [appliedFilterStaffCount, setAppliedFilterStaffCount] = useState<string>('ALL');
  const [filterSpaceSize, setFilterSpaceSize] = useState<string>('ALL');
  const [appliedFilterSpaceSize, setAppliedFilterSpaceSize] = useState<string>('ALL');
  const [filterCompetitors, setFilterCompetitors] = useState<string>('ALL');
  const [appliedFilterCompetitors, setAppliedFilterCompetitors] = useState<string>('ALL');

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

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilterRank(filterRank);
    setAppliedFilterJudgment(filterJudgment);
    setAppliedFilterPrefecture(filterPrefecture);
    setAppliedFilterEnvironment(filterEnvironment);
    setAppliedFilterRegisterCount(filterRegisterCount);
    setAppliedFilterTrafficCount(filterTrafficCount);
    setAppliedFilterSeasonality(filterSeasonality);
    setAppliedFilterBusyDay(filterBusyDay);
    setAppliedFilterStaffCount(filterStaffCount);
    setAppliedFilterSpaceSize(filterSpaceSize);
    setAppliedFilterCompetitors(filterCompetitors);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchesSearch =
        v.facilityName?.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
        v.staffName?.toLowerCase().includes(appliedSearchTerm.toLowerCase());
      const matchesRank = appliedFilterRank === 'ALL' || v.rank === appliedFilterRank;
      const matchesJudgment = appliedFilterJudgment === 'ALL' || v.judgment === appliedFilterJudgment;
      const matchesPrefecture = appliedFilterPrefecture === 'ALL' || v.prefecture === appliedFilterPrefecture;
      const matchesEnvironment = appliedFilterEnvironment === 'ALL' || v.environment === appliedFilterEnvironment;
      const matchesRegisterCount = appliedFilterRegisterCount === 'ALL' || v.registerCount === appliedFilterRegisterCount;
      const matchesTrafficCount = appliedFilterTrafficCount === 'ALL' || v.trafficCount === appliedFilterTrafficCount;
      const matchesSeasonality = appliedFilterSeasonality === 'ALL' || v.seasonality === appliedFilterSeasonality;
      const matchesBusyDay = appliedFilterBusyDay === 'ALL' || v.busyDay === appliedFilterBusyDay;
      const matchesStaffCount = appliedFilterStaffCount === 'ALL' || v.staffCount === appliedFilterStaffCount;
      const matchesSpaceSize = appliedFilterSpaceSize === 'ALL' || v.spaceSize === appliedFilterSpaceSize;
      const matchesCompetitors = appliedFilterCompetitors === 'ALL' || v.competitors === appliedFilterCompetitors;
      return matchesSearch && matchesRank && matchesJudgment && matchesPrefecture && 
             matchesEnvironment && matchesRegisterCount && matchesTrafficCount && 
             matchesSeasonality && matchesBusyDay && matchesStaffCount && 
             matchesSpaceSize && matchesCompetitors;
    });
  }, [visits, appliedSearchTerm, appliedFilterRank, appliedFilterJudgment, appliedFilterPrefecture, 
      appliedFilterEnvironment, appliedFilterRegisterCount, appliedFilterTrafficCount, 
      appliedFilterSeasonality, appliedFilterBusyDay, appliedFilterStaffCount, appliedFilterSpaceSize, appliedFilterCompetitors]);

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
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            filterRank={filterRank}
            onFilterRankChange={setFilterRank}
            filterJudgment={filterJudgment}
            onFilterJudgmentChange={setFilterJudgment}
            filterPrefecture={filterPrefecture}
            onFilterPrefectureChange={setFilterPrefecture}
            filterEnvironment={filterEnvironment}
            onFilterEnvironmentChange={setFilterEnvironment}
            filterRegisterCount={filterRegisterCount}
            onFilterRegisterCountChange={setFilterRegisterCount}
            filterTrafficCount={filterTrafficCount}
            onFilterTrafficCountChange={setFilterTrafficCount}
            filterSeasonality={filterSeasonality}
            onFilterSeasonalityChange={setFilterSeasonality}
            filterBusyDay={filterBusyDay}
            onFilterBusyDayChange={setFilterBusyDay}
            filterStaffCount={filterStaffCount}
            onFilterStaffCountChange={setFilterStaffCount}
            filterSpaceSize={filterSpaceSize}
            onFilterSpaceSizeChange={setFilterSpaceSize}
            filterCompetitors={filterCompetitors}
            onFilterCompetitorsChange={setFilterCompetitors}
            filteredVisits={filteredVisits}
          />
        </div>
      </main>
    </div>
  );
}

