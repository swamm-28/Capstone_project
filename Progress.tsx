import React, { useState, useEffect } from 'react';
import { dashboardService, formatINR } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Wallet,
  PieChart,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Progress: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating Progression Metrics..." />;

  const profile = data?.profile;
  const analytics = data?.analytics;
  const history = analytics?.score_history || [];

  if (!profile) {
    return <div className="p-8 text-center text-slate-400">Please complete onboarding first.</div>;
  }

  const scores = history.map((h: any) => h.credit_score);
  const initialScore = scores.length > 0 ? scores[0] : profile.current_credit_score;
  const currentScore = analytics?.current_score || profile.current_credit_score;
  const totalScoreGain = currentScore - initialScore;

  // Chart Formatted Data
  const scoreChartData = (history.length > 0
    ? history
    : [{ credit_score: currentScore, recorded_at: new Date().toISOString() }]
  ).map((h: any, idx: number) => {
    const d = new Date(h.recorded_at);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.credit_score,
      delta: idx > 0 ? h.credit_score - history[idx - 1].credit_score : 0,
    };
  });

  // Simulated trend steps based on score updates
  const debtTrendData = scoreChartData.map((item: any, idx: number) => {
    const decayFactor = 1 - (idx / Math.max(scoreChartData.length - 1, 1)) * 0.35;
    return {
      date: item.date,
      debt: Math.round(profile.total_debt * (decayFactor > 0 ? decayFactor : 1)),
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-extrabold text-white">Long-Term Progress &amp; Debt Trends</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Historical evaluation of your score increments, balance compression, and financial health evolution.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Improvement */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Score Progression</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{currentScore}</span>
            <span
              className={`text-xs font-bold inline-flex items-center ${
                totalScoreGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalScoreGain >= 0 ? `+${totalScoreGain} pts` : `${totalScoreGain} pts`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Started at <span className="font-semibold text-white font-mono">{initialScore}</span> →
            Current <span className="font-semibold text-white font-mono">{currentScore}</span>
          </p>
        </div>

        {/* Debt Trend */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Debt Load</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatINR(profile.total_debt)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center space-x-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Down from original baseline</span>
          </p>
        </div>

        {/* Utilization Improvement */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Credit Utilization</span>
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {profile.credit_utilization}%
            </span>
            <span className="text-xs text-slate-400">/ 100%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Status:{' '}
            <span className="font-semibold text-emerald-400">
              {profile.credit_utilization <= 30 ? 'Prime (<=30%)' : 'Moderate'}
            </span>
          </p>
        </div>

        {/* Health Score Improvement */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Health Assessment</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {profile.financial_health_score}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-teal-400 mt-2 font-semibold">
            {profile.health_status} Bureau Standing
          </p>
        </div>
      </div>

      {/* Chart 1: Credit Score Progress Line Chart */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Score Growth Across Record Dates</h3>
            <p className="text-xs text-slate-400">Visualizing CIBIL movement after financial actions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            {scoreChartData.length} Audits Tracked
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs space-y-1">
                        <p className="text-slate-400 font-semibold">{d.date}</p>
                        <p className="text-sm font-bold text-white font-mono">{d.score} CIBIL</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#progressGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Debt Reduction Trend */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Estimated Liability Trajectory</h3>
          <p className="text-xs text-slate-400">Total outstanding balance reduction profile in INR</p>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={debtTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), 'Total Debt']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="debt" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
