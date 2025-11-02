'use client';

import { useEffect, useState } from 'react';
import { analyticsApi, PopupStats, popupsApi, Popup } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Eye, Target, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [shopStats, setShopStats] = useState<any>(null);
  const [popupStats, setPopupStats] = useState<Record<string, PopupStats>>({});
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopId') || 'demo-shop';
    }
    return 'demo-shop';
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shopStatsRes, popupsRes] = await Promise.all([
        analyticsApi.getShopStats(shopId),
        popupsApi.getAll(shopId),
      ]);

      setShopStats(shopStatsRes.data);
      setPopups(popupsRes.data);

      const statsPromises = popupsRes.data.map(async (popup) => {
        try {
          const statsRes = await analyticsApi.getPopupStats(popup.id);
          return { popupId: popup.id, stats: statsRes.data };
        } catch (error) {
          return { popupId: popup.id, stats: null };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, PopupStats> = {};
      statsResults.forEach(({ popupId, stats }) => {
        if (stats) {
          statsMap[popupId] = stats;
        }
      });
      setPopupStats(statsMap);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = popups.map((popup) => ({
    name: popup.name.length > 15 ? popup.name.substring(0, 15) + '...' : popup.name,
    views: popupStats[popup.id]?.views || 0,
    conversions: popupStats[popup.id]?.conversions || 0,
    conversionRate: (popupStats[popup.id]?.conversionRate || 0).toFixed(1),
  }));

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <div className="glass-effect rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="ml-1 font-semibold">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1 text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{title}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Track performance and optimize your popups</p>
        </div>

        {shopStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Popups"
              value={shopStats.totalPopups || 0}
              icon={Activity}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              title="Total Views"
              value={(shopStats.totalViews || 0).toLocaleString()}
              icon={Eye}
              color="from-indigo-500 to-purple-500"
            />
            <StatCard
              title="Total Conversions"
              value={(shopStats.totalConversions || 0).toLocaleString()}
              icon={Target}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              title="Avg Conversion Rate"
              value={`${(shopStats.averageConversionRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              color="from-orange-500 to-red-500"
            />
          </div>
        )}

        {chartData.length > 0 ? (
          <>
            <div className="glass-effect rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Popup Performance Overview</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="views" 
                    fill="#6366f1" 
                    name="Views"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="conversions" 
                    fill="#10b981" 
                    name="Conversions"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Conversion Rates</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Conversion Rate (%)"
                    dot={{ fill: '#f59e0b', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Popup Details Table */}
            <div className="glass-effect rounded-2xl p-6 mt-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Detailed Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Popup</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Views</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Conversions</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Conversion Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popups.map((popup) => {
                      const stats = popupStats[popup.id];
                      return (
                        <tr key={popup.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">{popup.name}</td>
                          <td className="py-4 px-4 text-right text-slate-600">{stats?.views || 0}</td>
                          <td className="py-4 px-4 text-right text-slate-600">{stats?.conversions || 0}</td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '0%'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-slate-900">
                            ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">No data yet</h3>
            <p className="text-slate-600 mb-6">Create popups and start tracking visitors to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
