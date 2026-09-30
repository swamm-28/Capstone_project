import React, { useState, useEffect } from 'react';
import { dashboardService, formatINR } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
  Percent,
  Layers,
  CreditCard,
  Calendar,
} from 'lucide-react';

export const CreditHealth: React.FC = () => {
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

  if (loading) return <LoadingSpinner message="Evaluating Bureau Parameters..." />;

  const profile = data?.profile;
  const analytics = data?.analytics;

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please complete your onboarding profile first.
      </div>
    );
  }

  const score = analytics?.current_score || profile.current_credit_score;
  const util = analytics?.credit_utilization || profile.credit_utilization;
  const dti = analytics?.dti_ratio || profile.dti_ratio;
  const missed = profile.missed_payments;
  const loans = profile.active_loans;
  const debt = profile.total_debt;

  const factors = [
    {
      title: 'Payment History & DPD Records',
      weight: '~35% of Bureau Weight',
      value: missed === 0 ? 'Pristine (0 Missed)' : `${missed} Default(s) Recorded`,
      status: missed === 0 ? 'Optimal' : 'High Risk',
      statusColor: missed === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
      description:
        'Lenders evaluate Days Past Due (DPD) across loans and cards. Zero defaults ensures maximum bureau reliability.',
      recommendation:
        missed === 0
          ? 'Maintain auto-debit on salary accounts to ensure no inadvertent late fees.'
          : 'Set up immediate NACH mandates to avoid compounding bureau delinquency flags.',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Credit Utilization Ratio (CUR)',
      weight: '~30% of Bureau Weight',
      value: `${util}% Utilized`,
      status: util <= 30 ? 'Optimal' : util <= 50 ? 'Moderate' : 'High Risk',
      statusColor:
        util <= 30
          ? 'text-emerald-400 bg-emerald-500/10'
          : util <= 50
          ? 'text-amber-400 bg-amber-500/10'
          : 'text-rose-400 bg-rose-500/10',
      description: `Active card spends of ${formatINR(analytics?.used_credit)} against total sanctioned limit of ${formatINR(profile.credit_limit)}.`,
      recommendation:
        util <= 30
          ? 'Exceptional discipline. Continue paying balances prior to statement cut-off.'
          : 'Request card limit enhancement or pay off balances mid-cycle to dip below 30%.',
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Debt-to-Income (DTI) Capacity',
      weight: 'Underwriting Benchmark',
      value: `${dti}% Obligations`,
      status: dti <= 35 ? 'Healthy' : dti <= 50 ? 'Manageable' : 'Constrained',
      statusColor:
        dti <= 35
          ? 'text-emerald-400 bg-emerald-500/10'
          : dti <= 50
          ? 'text-amber-400 bg-amber-500/10'
          : 'text-rose-400 bg-rose-500/10',
      description: `Monthly living and EMI obligations (${formatINR(profile.monthly_expenses)}) vs gross earnings (${formatINR(profile.monthly_income)}).`,
      recommendation:
        dti <= 35
          ? 'High borrowing headroom for prospective home or auto loan approvals.'
          : 'Direct discretionary bonuses towards debt prepayments to compress recurring EMI obligations.',
      icon: <Percent className="w-5 h-5 text-indigo-400" />,
    },
    {
      title: 'Total Debt Burden',
      weight: 'Liability Exposure',
      value: formatINR(debt),
      status: debt < profile.monthly_income * 6 ? 'Manageable' : 'Elevated Exposure',
      statusColor:
        debt < profile.monthly_income * 6
          ? 'text-blue-400 bg-blue-500/10'
          : 'text-amber-400 bg-amber-500/10',
      description: `Cumulative principal obligations active across Indian banking facilities.`,
      recommendation:
        'Focus on retiring unsecured high-interest personal loans first before prepaying low-cost secured debts.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Active Loan Facilities & Credit Mix',
      weight: '~10% of Bureau Weight',
      value: `${loans} Active Accounts`,
      status: loans <= 3 ? 'Balanced Portfolio' : 'High Account Volume',
      statusColor: loans <= 3 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
      description: 'Lenders favor a balanced mix between secured credit (home/car) and unsecured cards.',
      recommendation:
        'Avoid submitting multiple loan or card applications simultaneously to prevent hard inquiry cascades.',
      icon: <Layers className="w-5 h-5 text-violet-400" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-extrabold text-white">Financial Health Breakdown</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed diagnostic of the core pillars determining creditworthiness in Indian retail banking.
        </p>
      </div>

      {/* Overview Metric Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Overall Health Assessment
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            {profile.financial_health_score} / 100 — {profile.health_status}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Composite index derived from CIBIL score tier ({score}), utilization ({util}%), debt coverage ratio ({dti}%), and historical payment reliability.
          </p>
        </div>

        <div className="flex items-center space-x-4 self-start md:self-auto shrink-0 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">CIBIL Score</p>
            <p className="text-xl font-bold text-white font-mono">{score}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Utilization</p>
            <p className="text-xl font-bold text-blue-400 font-mono">{util}%</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">DTI Ratio</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">{dti}%</p>
          </div>
        </div>
      </div>

      {/* Factor Cards List */}
      <div className="space-y-4">
        {factors.map((factor, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                {factor.icon}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{factor.title}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {factor.weight}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${factor.statusColor}`}>
                    {factor.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
                <div className="pt-2 flex items-start space-x-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Action Step:</strong> {factor.recommendation}
                  </span>
                </div>
              </div>
            </div>

            <div className="self-end lg:self-center px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl shrink-0 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Reported Value</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{factor.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
