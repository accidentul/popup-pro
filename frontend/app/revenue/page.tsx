'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { revenueApi, RevenueStats, ActivityFeedItem, HourlyDataPoint, TopPopup, ConversionBreakdown } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle2, AlertCircle, Clock, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueDashboard() {
  const [shopId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopId') || 'demo-shop';
    }
    return 'demo-shop';
  });

  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>([]);
  const [topPopups, setTopPopups] = useState<TopPopup[]>([]);
  const [conversionBreakdown, setConversionBreakdown] = useState<ConversionBreakdown[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // const audioRef = useRef<HTMLAudioElement | null>(null); // Disabled for now

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [shopId, period]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const newSocket = io(`${API_BASE_URL}/revenue`, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('subscribe', shopId);
    });

    newSocket.on('cart_abandoned', (data) => {
      console.log('Cart abandoned:', data);

      // Add to activity feed
      setActivityFeed(prev => [{
        id: data.id,
        type: 'abandonment',
        value: data.value,
        items: data.items,
        location: data.location,
        deviceType: data.deviceType,
        trafficSource: data.trafficSource,
        timestamp: data.timestamp,
        timeAgo: 'Just now',
      }, ...prev.slice(0, 19)]);

      // Refresh stats
      loadStats();

      // Show notification
      showNotification(`⚠️ $${data.value.toFixed(2)} cart abandoned`, 'warning');
    });

    newSocket.on('cart_recovered', (data) => {
      console.log('Cart recovered:', data);

      // Add to activity feed
      setActivityFeed(prev => [{
        id: data.id,
        type: 'recovery',
        value: data.value,
        timestamp: data.timestamp,
        recoveredVia: data.recoveryMethod,
        popupName: data.popupName,
        items: [],
        timeAgo: 'Just now',
      }, ...prev.slice(0, 19)]);

      // Refresh stats
      loadStats();

      // Show celebration
      showNotification(`🎉 $${data.value.toFixed(2)} RECOVERED!`, 'success');
      playSuccessSound();
    });

    newSocket.on('stats_updated', (updatedStats) => {
      setStats(updatedStats);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [shopId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadActivityFeed(),
        loadHourlyData(),
        loadTopPopups(),
        loadConversionBreakdown(),
      ]);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await revenueApi.getStats(shopId, period);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadActivityFeed = async () => {
    try {
      const response = await revenueApi.getActivityFeed(shopId, 20);
      setActivityFeed(response.data);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    }
  };

  const loadHourlyData = async () => {
    try {
      const response = await revenueApi.getHourlyBreakdown(shopId);
      setHourlyData(response.data);
    } catch (error) {
      console.error('Failed to load hourly data:', error);
    }
  };

  const loadTopPopups = async () => {
    try {
      const response = await revenueApi.getTopPopups(shopId, 5);
      setTopPopups(response.data);
    } catch (error) {
      console.error('Failed to load top popups:', error);
    }
  };

  const loadConversionBreakdown = async () => {
    try {
      const response = await revenueApi.getConversionBreakdown(shopId);
      setConversionBreakdown(response.data);
    } catch (error) {
      console.error('Failed to load conversion breakdown:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'warning') => {
    // You can implement a toast notification library here
    // For now, we'll use the browser notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ExitIntent Pro', { body: message });
    }
  };

  const playSuccessSound = () => {
    // Audio disabled for now - can be enabled later with proper sound file
    // if (audioRef.current) {
    //   audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    // }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Chart data
  const chartData = {
    labels: hourlyData.map(d => `${d.hour}:00`),
    datasets: [
      {
        label: 'Recovered',
        data: hourlyData.map(d => d.recovered),
        borderColor: 'rgb(72, 187, 120)',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'At Risk',
        data: hourlyData.map(d => d.atRisk),
        borderColor: 'rgb(245, 101, 101)',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgb(15, 23, 42)',
        titleColor: 'rgb(203, 213, 225)',
        bodyColor: 'rgb(148, 163, 184)',
        borderColor: 'rgb(51, 65, 85)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(148, 163, 184)',
          callback: function(value: any) {
            return '$' + value;
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading Revenue Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Success sound - disabled for now */}
      {/* <audio ref={audioRef} src="/success-sound.mp3" preload="auto" /> */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                💰 Revenue Recovery Intelligence
              </span>
            </h1>
            <p className="text-slate-400 mt-2">Real-time revenue tracking and cart abandonment recovery</p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* At Risk */}
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">💸 AT RISK</p>
                <p className="text-3xl font-bold text-white">${stats?.atRisk.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">{stats?.abandonedCount || 0} abandoned carts</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
            <TrendingUp className="h-4 w-4" />
            <span>Live updates</span>
          </div>
        </div>

        {/* Recovered */}
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">✅ RECOVERED</p>
                <p className="text-3xl font-bold text-white">${stats?.recovered.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">{stats?.recoveredCount || 0} recovered carts</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span>+{stats?.recoveredCount || 0} today</span>
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">📈 RECOVERY RATE</p>
                <p className="text-3xl font-bold text-white">{stats?.recoveryRate.toFixed(1) || '0.0'}%</p>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Conversion performance</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-cyan-400">
            <TrendingUp className="h-4 w-4" />
            <span>Industry avg: 35%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">
          💵 Revenue Recovery Timeline (Today)
        </h2>
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Activity Feed */}
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🔴 LIVE ACTIVITY FEED
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {activityFeed.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No activity yet. Waiting for cart events...</p>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    item.type === 'recovery'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'recovery' ? (
                        <span className="text-2xl">🎉</span>
                      ) : (
                        <span className="text-2xl">⚠️</span>
                      )}
                      <div>
                        <p className={`font-bold ${item.type === 'recovery' ? 'text-green-400' : 'text-red-400'}`}>
                          ${item.value.toFixed(2)} {item.type === 'recovery' ? 'RECOVERED!' : 'cart abandoned'}
                        </p>
                        {item.popupName && (
                          <p className="text-sm text-slate-400">via {item.popupName}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{item.timeAgo}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(item.deviceType)}
                        {item.deviceType || 'desktop'}
                      </div>
                      {item.trafficSource && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.trafficSource}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Popups */}
        <div className="space-y-8">
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6">🏆 Top Performing Popups</h2>
            <div className="space-y-4">
              {topPopups.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No popup data yet</p>
              ) : (
                topPopups.map((popup, index) => (
                  <div key={popup.popupId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-300 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-700 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{popup.popupName}</p>
                        <p className="text-sm text-slate-400">{popup.recoveryCount} recoveries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${popup.totalRecovered.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conversion Breakdown */}
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6">📊 Conversion Breakdown</h2>
            <div className="space-y-3">
              {conversionBreakdown.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No conversion data yet</p>
              ) : (
                conversionBreakdown.map((item) => (
                  <div key={item.method} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 capitalize">{item.method.replace('_', ' ')}</span>
                      <span className="text-slate-400">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
