import React from 'react';
import { Activity, ShieldCheck, Info } from 'lucide-react';

interface FinancialHealthCardProps {
  healthScore: number;
  status: string;
  creditUtilization: number;
  dtiRatio: number;
  missedPayments: number;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  healthScore = 78,
  status = 'Good',
  creditUtilization = 37.5,
  dtiRatio = 31.0,
  missedPayments = 0,
}) => {
  const getStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'excellent':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'fair':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial Health Score
            </h3>
            <p className="text-[11px] text-slate-400">Holistic Wellness Assessment</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      <div className="flex items-baseline space-x-2 my-2">
        <span className="text-5xl font-extrabold tracking-tight text-white font-mono">
          {healthScore}
        </span>
        <span className="text-xl font-medium text-slate-400">/ 100</span>
      </div>

      {/* Factor Breakdown Mini-Bars */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-2">
        <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Credit Util.</p>
          <p className="text-xs font-bold text-white mt-0.5 font-mono">{creditUtilization}%</p>
          <span
            className={`text-[9px] font-semibold ${
              creditUtilization <= 30
                ? 'text-emerald-400'
                : creditUtilization <= 50
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {creditUtilization <= 30 ? 'Optimal' : creditUtilization <= 50 ? 'Moderate' : 'High'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">DTI Ratio</p>
          <p className="text-xs font-bold text-white mt-0.5 font-mono">{dtiRatio}%</p>
          <span
            className={`text-[9px] font-semibold ${
              dtiRatio <= 35 ? 'text-emerald-400' : dtiRatio <= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {dtiRatio <= 35 ? 'Healthy' : dtiRatio <= 50 ? 'Manageable' : 'Elevated'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Defaults</p>
          <p className="text-xs font-bold text-white mt-0.5 font-mono">{missedPayments}</p>
          <span
            className={`text-[9px] font-semibold ${
              missedPayments === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {missedPayments === 0 ? 'Clean Track' : 'Attention'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Calculated composite index based on Indian credit & repayment factors.</span>
      </div>
    </div>
  );
};
