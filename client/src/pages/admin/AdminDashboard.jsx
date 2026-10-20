import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load admin platform analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading platform analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const kpis = [
    {
      title: 'Total Residents',
      value: metrics.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Active Providers',
      value: metrics.totalProviders || 0,
      subValue: `${metrics.verifiedProviders || 0} Verified`,
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Pending Verifications',
      value: metrics.pendingVerifications || 0,
      alert: (metrics.pendingVerifications || 0) > 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      link: '/admin/verifications',
    },
    {
      title: 'Total Bookings',
      value: (metrics.activeBookings || 0) + (metrics.completedBookings || 0),
      subValue: `${metrics.activeBookings || 0} In Progress`,
      icon: CalendarCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Platform Volume',
      value: `₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`,
      subValue: 'Razorpay Verified',
      icon: IndianRupee,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Open Disputes',
      value: metrics.openDisputes || 0,
      alert: (metrics.openDisputes || 0) > 0,
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      link: '/admin/disputes',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900">Platform Command Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational monitoring, provider verification queues, and dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/verifications"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifications ({metrics.pendingVerifications || 0})</span>
          </Link>
          <Link
            to="/admin/disputes"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Disputes ({metrics.openDisputes || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const CardContent = (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md ${
                kpi.alert ? 'ring-2 ring-amber-400/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {kpi.link && <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{kpi.value}</p>
              {kpi.subValue && (
                <p className="text-[10px] text-slate-400 font-medium mt-1">{kpi.subValue}</p>
              )}
            </div>
          );

          return kpi.link ? (
            <Link key={idx} to={kpi.link}>
              {CardContent}
            </Link>
          ) : (
            CardContent
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Service Category Distribution</h2>
              <p className="text-xs text-slate-500">Market demand across local service verticals</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            {charts.categoryDistribution && charts.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Bookings" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category booking data yet.
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">7-Day Booking & Revenue Trend</h2>
              <p className="text-xs text-slate-500">Daily marketplace velocity</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            {charts.trends && charts.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    name="Daily Bookings"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend activity recorded for the past week.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/verifications"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
            Provider Verification Desk
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Review uploaded trade licenses, KYC proofs, and grant official verified provider status.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span>{metrics.pendingVerifications || 0} providers waiting</span>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            User Directory & Governance
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Search registered residents and providers, inspect account health, and enforce moderation.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <span>{(metrics.totalUsers || 0) + (metrics.totalProviders || 0)} registered accounts</span>
          </div>
        </Link>

        <Link
          to="/admin/disputes"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-rose-400 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
            Dispute Mediation Center
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mediate service conflicts, order resident refunds, or release escrowed provider payments.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span>{metrics.openDisputes || 0} active mediation cases</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
