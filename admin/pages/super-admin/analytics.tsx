'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Analytics {
  date: string;
  total_users: number;
  active_users: number;
  new_enrollments: number;
  completed_courses: number;
  total_revenue: number;
  total_complaints: number;
  resolved_complaints: number;
}

export default function Analytics() {
  const { token } = useAdminAuth();
  const [currentAnalytics, setCurrentAnalytics] = useState<Analytics | null>(null);
  const [historicalAnalytics, setHistoricalAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (!token) return;
    fetchAnalytics();
  }, [token, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch current analytics
      const currentResponse = await fetch('http://localhost:8000/api/admin/analytics/current', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentAnalytics(currentData);
      }

      // Fetch historical analytics
      const historicalResponse = await fetch(`http://localhost:8000/api/admin/analytics?days=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (historicalResponse.ok) {
        const historicalData = await historicalResponse.json();
        setHistoricalAnalytics(Array.isArray(historicalData) ? historicalData : []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon, change, changeLabel }: {
    label: string;
    value: any;
    icon: string;
    change?: string;
    changeLabel?: string;
  }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-cyan-400">{value || 0}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {change} {changeLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getPreviousValue = (field: keyof Analytics) => {
    if (historicalAnalytics.length < 2) return 0;
    return historicalAnalytics[1][field] as number || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">System Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time insights and trends</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-300 p-4 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400">⏳ Loading analytics...</p>
          </div>
        )}

        {/* Current Analytics */}
        {!loading && currentAnalytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={currentAnalytics.total_users}
                icon="👥"
                change={calculateChange(currentAnalytics.total_users, getPreviousValue('total_users'))}
                changeLabel="vs previous"
              />
              <StatCard
                label="Active Users"
                value={currentAnalytics.active_users}
                icon="🟢"
                change={calculateChange(currentAnalytics.active_users, getPreviousValue('active_users'))}
                changeLabel="vs previous"
              />
              <StatCard
                label="New Enrollments"
                value={currentAnalytics.new_enrollments}
                icon="📚"
                change={calculateChange(currentAnalytics.new_enrollments, getPreviousValue('new_enrollments'))}
                changeLabel="vs previous"
              />
              <StatCard
                label="Completed Courses"
                value={currentAnalytics.completed_courses}
                icon="🎓"
                change={calculateChange(currentAnalytics.completed_courses, getPreviousValue('completed_courses'))}
                changeLabel="vs previous"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Revenue"
                value={formatCurrency(currentAnalytics.total_revenue)}
                icon="💰"
                change={calculateChange(currentAnalytics.total_revenue, getPreviousValue('total_revenue'))}
                changeLabel="vs previous"
              />
              <StatCard
                label="Total Complaints"
                value={currentAnalytics.total_complaints}
                icon="⚠️"
                change={calculateChange(currentAnalytics.total_complaints, getPreviousValue('total_complaints'))}
                changeLabel="vs previous"
              />
              <StatCard
                label="Resolved Complaints"
                value={currentAnalytics.resolved_complaints}
                icon="✅"
                change={calculateChange(currentAnalytics.resolved_complaints, getPreviousValue('resolved_complaints'))}
                changeLabel="vs previous"
              />
            </div>

            {/* Trends Section */}
            {historicalAnalytics.length > 1 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Recent Trends</h2>
                <div className="space-y-4">
                  <div className="text-sm text-gray-400">
                    Showing data for the last {timeRange} days
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">User Growth</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Latest:</span>
                          <span className="text-white">{currentAnalytics.total_users} users</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">7 days ago:</span>
                          <span className="text-white">
                            {historicalAnalytics.slice(-7)[0]?.total_users || 0} users
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{timeRange} days ago:</span>
                          <span className="text-white">
                            {historicalAnalytics[historicalAnalytics.length - 1]?.total_users || 0} users
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Revenue Trend</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Revenue:</span>
                          <span className="text-white">{formatCurrency(currentAnalytics.total_revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Avg per day:</span>
                          <span className="text-white">
                            {formatCurrency(currentAnalytics.total_revenue / parseInt(timeRange))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Resolution Rate:</span>
                          <span className="text-white">
                            {currentAnalytics.total_complaints > 0
                              ? `${((currentAnalytics.resolved_complaints / currentAnalytics.total_complaints) * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Table */}
            {historicalAnalytics.length > 0 && (
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">Historical Data</h2>
                  <p className="text-gray-400 text-sm">Last {timeRange} days of analytics</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-700">
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Users</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Active</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Enrollments</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Completed</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Revenue</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Complaints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalAnalytics.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition">
                          <td className="px-4 py-3 text-white">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-white">{item.total_users}</td>
                          <td className="px-4 py-3 text-white">{item.active_users}</td>
                          <td className="px-4 py-3 text-white">{item.new_enrollments}</td>
                          <td className="px-4 py-3 text-white">{item.completed_courses}</td>
                          <td className="px-4 py-3 text-white">{formatCurrency(item.total_revenue)}</td>
                          <td className="px-4 py-3 text-white">{item.total_complaints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Data State */}
        {!loading && !currentAnalytics && !error && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
            <p className="text-gray-400">No analytics data available. The system may still be collecting data.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
