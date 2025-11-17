// client/src/pages/DashboardPage.tsx
// ===== MANUFACTURING DASHBOARD WITH STATISTICS AND CHARTS =====
// Show OQA, OBA, SIV statistics and weekly trends

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentFiscalWeek, getCurrentFiscalYear } from '../utils';
import { formatNumber} from '../utils';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ============ INTERFACES ============

interface StationStats {
  station: string;
  totalRecords: number;
  thisYear: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

interface WeeklyChartData {
  ww: string;
  total: number;
  pass: number;
  fail: number;
}

// ============ COMPONENT ============

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current FY and WW
  const [currentFY, setCurrentFY] = useState<string>('');
  const [currentWW, setCurrentWW] = useState<string>('');

  // OQA Statistics
  const [oqaStats, setOqaStats] = useState<StationStats>({
    station: 'OQA',
    totalRecords: 0,
    thisYear: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0
  });
  const [oqaWeeklyData, setOqaWeeklyData] = useState<WeeklyChartData[]>([]);

  // OBA Statistics
  const [obaStats, setObaStats] = useState<StationStats>({
    station: 'OBA',
    totalRecords: 0,
    thisYear: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0
  });
  const [obaWeeklyData, setObaWeeklyData] = useState<WeeklyChartData[]>([]);

  // SIV Statistics
  const [sivStats, setSivStats] = useState<StationStats>({
    station: 'SIV',
    totalRecords: 0,
    thisYear: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0
  });
  const [sivWeeklyData, setSivWeeklyData] = useState<WeeklyChartData[]>([]);

  // ============ DATA LOADING ============

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate current FY and WW
      calculateCurrentFYandWW();

      // Load statistics for all three stations
      await Promise.all([
        loadStationStats('OQA'),
        loadStationStats('OBA'),
        loadStationStats('SIV')
      ]);

      // Load weekly chart data for all three stations
      await Promise.all([
        loadWeeklyChartData('OQA'),
        loadWeeklyChartData('OBA'),
        loadWeeklyChartData('SIV')
      ]);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentFYandWW = () => {
    // Get current fiscal year and week using utility functions
    // Fiscal year starts on July 1st, weeks start on Saturday
    const fiscalYear = getCurrentFiscalYear(6); // 6 = Saturday
    const fiscalWeek = getCurrentFiscalWeek(6);

    // Format FY as 2-digit year (e.g., 2024 -> "24")
    const fy = String(fiscalYear).slice(-2);
    const ww = String(fiscalWeek).padStart(2, '0');

    setCurrentFY(fy);
    setCurrentWW(ww);
  };

  const loadStationStats = async (station: string) => {
    try {
      const result = await api.get(`/inspectiondata/stats/${station}`);

      if (result.success && result.data) {
        const stats: StationStats = {
          station: station,
          totalRecords: result.data.total || 0,
          thisYear: result.data.this_year || 0,
          thisMonth: result.data.this_month || 0,
          thisWeek: result.data.this_week || 0,
          today: result.data.today || 0
        };

        switch (station) {
          case 'OQA':
            setOqaStats(stats);
            break;
          case 'OBA':
            setObaStats(stats);
            break;
          case 'SIV':
            setSivStats(stats);
            break;
        }
      }
    } catch (err) {
      console.error(`Error loading ${station} stats:`, err);
    }
  };

  const loadWeeklyChartData = async (station: string) => {
    try {
      const result = await api.get(`/inspectiondata/weekly-trend/${station}`);

      if (result.success && result.data) {
        const chartData: WeeklyChartData[] = result.data.map((item: any) => ({
          ww: `WW${item.ww}`,
          total: item.total || 0,
          pass: item.pass || 0,
          fail: item.fail || 0
        }));

        switch (station) {
          case 'OQA':
            setOqaWeeklyData(chartData);
            break;
          case 'OBA':
            setObaWeeklyData(chartData);
            break;
          case 'SIV':
            setSivWeeklyData(chartData);
            break;
        }
      }
    } catch (err) {
      console.error(`Error loading ${station} weekly data:`, err);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // ============ RENDER STAT CARD ============

  const renderStatCard = (stats: StationStats, color: string) => {
    const colorClasses = {
      orange: {
        bg: 'bg-orange-500',
        light: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        label: 'text-orange-600'
      },
      green: {
        bg: 'bg-green-500',
        light: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        label: 'text-green-600'
      },
      blue: {
        bg: 'bg-blue-500',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        label: 'text-blue-600'
      }
    };

    const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.orange;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className={`${colors.bg} px-6 py-4`}>
          <h3 className="text-2xl font-bold text-white">{stats.station}</h3>
          <p className="text-white/80 text-sm">Quality Inspection Records</p>
        </div>
        <div className="p-6 space-y-4">
          <div className={`${colors.light} border ${colors.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${colors.label}`}>Total Records</span>
              <span className={`text-2xl font-bold ${colors.text}`}>{formatNumber(stats.totalRecords.toString())}</span>
            </div>
          </div> 

          <div className="grid grid-cols-2 gap-3">
            <div className={`${colors.light} border ${colors.border} rounded-lg p-3`}>
              <div className={`text-xs font-medium ${colors.label} mb-1`}>This Year</div>
              <div className={`text-xl font-bold ${colors.text}`}>{formatNumber(stats.thisYear.toString())}</div>
            </div>
            <div className={`${colors.light} border ${colors.border} rounded-lg p-3`}>
              <div className={`text-xs font-medium ${colors.label} mb-1`}>This Month</div>
              <div className={`text-xl font-bold ${colors.text}`}>{formatNumber(stats.thisMonth.toString())}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${colors.light} border ${colors.border} rounded-lg p-3`}>
              <div className={`text-xs font-medium ${colors.label} mb-1`}>This Week</div>
              <div className={`text-xl font-bold ${colors.text}`}>{formatNumber(stats.thisWeek.toString())}</div>
            </div>
            <div className={`${colors.light} border ${colors.border} rounded-lg p-3`}>
              <div className={`text-xs font-medium ${colors.label} mb-1`}>Today</div>
              <div className={`text-xl font-bold ${colors.text}`}>{formatNumber(stats.today.toString())}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER CHART ============

  const renderChart = (data: WeeklyChartData[], station: string, color: string) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="ww"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="square"
          />
          <Bar dataKey="total" fill="#94a3b8" name="Total Qty" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pass" fill="#22c55e" name="Pass" radius={[4, 4, 0, 0]} />
          <Bar dataKey="fail" fill="#ef4444" name="Fail" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Quality Control Dashboard</h1>
                <p className="text-purple-100 mt-1">
                  Welcome back, {user?.username || 'User'}. Here's your inspection overview.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-white font-medium">Refresh</span>
                </button>
                <div className="text-right">
                  <div className="text-white text-sm">Last updated</div>
                  <div className="text-purple-100 text-xs">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current FY and WW Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current FY Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Current Fiscal Year</h3>
                  <p className="text-4xl font-bold text-white mt-1">FY {currentFY || '--'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-orange-50">
              <p className="text-sm text-orange-700">
                Fiscal year period for tracking annual performance
              </p>
            </div>
          </div>

          {/* Current WW Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Current Work Week</h3>
                  <p className="text-4xl font-bold text-white mt-1">WW {currentWW || '--'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-cyan-50">
              <p className="text-sm text-cyan-700">
                Current work week number for weekly tracking
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-900 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderStatCard(oqaStats, 'orange')}
          {renderStatCard(obaStats, 'green')}
          {renderStatCard(sivStats, 'blue')}
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* OQA Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">OQA Weekly Trend</h3>
              <p className="text-orange-100 text-sm">Inspection quantities by work week</p>
            </div>
            <div className="p-6">
              {renderChart(oqaWeeklyData, 'OQA', 'orange')}
            </div>
          </div>

          {/* OBA Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">OBA Weekly Trend</h3>
              <p className="text-green-100 text-sm">Inspection quantities by work week</p>
            </div>
            <div className="p-6">
              {renderChart(obaWeeklyData, 'OBA', 'green')}
            </div>
          </div>

          {/* SIV Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">SIV Weekly Trend</h3>
              <p className="text-blue-100 text-sm">Inspection quantities by work week</p>
            </div>
            <div className="p-6">
              {renderChart(sivWeeklyData, 'SIV', 'blue')}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/inspection/oqa"
                className="group block p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-orange-500 p-3 rounded-lg text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">OQA Station</h4>
                  <p className="text-xs text-gray-600">Outgoing Quality Assurance</p>
                </div>
              </Link>

              <Link
                to="/inspection/oba"
                className="group block p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-500 p-3 rounded-lg text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">OBA Station</h4>
                  <p className="text-xs text-gray-600">Outgoing Before Assembly</p>
                </div>
              </Link>

              <Link
                to="/inspection/siv"
                className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-500 p-3 rounded-lg text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">SIV Station</h4>
                  <p className="text-xs text-gray-600">Supplier Incoming Verification</p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="group block p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-500 p-3 rounded-lg text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Reports</h4>
                  <p className="text-xs text-gray-600">View inspection reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
