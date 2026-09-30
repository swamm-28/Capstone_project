import React from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Edit3 } from 'lucide-react';

interface CreditScoreCardProps {
  currentScore: number;
  previousScore?: number;
  delta?: number;
  status: string;
  onUpdateScore?: () => void;
}

export const CreditScoreCard: React.FC<CreditScoreCardProps> = ({
  currentScore = 735,
  previousScore = 715,
  delta = 20,
  status = 'Good',
  onUpdateScore,
}) => {
  // Score percentage for visual arc / progress bar (300 to 900 scale)
  const clamped = Math.max(300, Math.min(900, currentScore));
  const progressPct = Math.round(((clamped - 300) / 600) * 100);

  // Status colors
  const getStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'excellent':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'good':
        return { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
      case 'fair':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      default:
        return { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    }
  };

  const statusStyle = getStatusColor(status);

  return (
    <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden group">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              CIBIL Credit Score
            </h3>
            <p className="text-[11px] text-slate-400">TransUnion / Indian Bureau Scale</p>
          </div>
        </div>

        {onUpdateScore && (
          <button
            onClick={onUpdateScore}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            title="Log updated credit score"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update</span>
          </button>
        )}
      </div>

      <div className="flex items-baseline space-x-3 my-2">
        <span className="text-5xl font-extrabold tracking-tight text-white font-mono">
          {currentScore}
        </span>
        <div className="flex flex-col">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text}`}
          >
            {status}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Scale 300 – 900</span>
        </div>
      </div>

      {/* Progress Arc / Bar */}
      <div className="space-y-1.5 mt-4">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>300 (Poor)</span>
          <span>650 (Fair)</span>
          <span>750 (Excellent)</span>
          <span>900</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Footer stats: previous score & delta */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Previous Score:</span>
          <span className="font-semibold text-slate-300 font-mono">
            {previousScore !== undefined ? previousScore : currentScore}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {delta > 0 ? (
            <span className="inline-flex items-center text-emerald-400 font-semibold space-x-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{delta} pts</span>
            </span>
          ) : delta < 0 ? (
            <span className="inline-flex items-center text-rose-400 font-semibold space-x-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{delta} pts</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-400 font-medium space-x-0.5">
              <Minus className="w-3.5 h-3.5" />
              <span>No Change</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
