import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface ScoreItem {
  id?: number;
  credit_score: number;
  recorded_at: string;
  note?: string;
}

interface ScoreHistoryChartProps {
  data: ScoreItem[];
  currentScore?: number;
}

export const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({ data, currentScore }) => {
  // Format data for chart
  const formattedData = (data && data.length > 0 ? data : [
    { credit_score: currentScore || 650, recorded_at: new Date().toISOString(), note: 'Current' },
  ]).map((item) => {
    const d = new Date(item.recorded_at);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: item.credit_score,
      note: item.note || 'Recorded update',
    };
  });

  const scores = formattedData.map((d) => d.score);
  const minScore = Math.max(300, Math.min(...scores) - 30);
  const maxScore = Math.min(900, Math.max(...scores) + 30);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Credit Score Trajectory
            </h3>
            <p className="text-xs text-slate-400">Historical performance across tracking periods</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>CIBIL Score</span>
          </span>
          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <span>750+ Prime Benchmark</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              domain={[minScore, maxScore]}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-1">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{val.date}</span>
                      </div>
                      <div className="text-base font-extrabold text-blue-400 font-mono">
                        {val.score} CIBIL
                      </div>
                      <div className="text-[11px] text-slate-300 italic">{val.note}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={750} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{ r: 6, fill: '#60A5FA', stroke: '#1E3A8A', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
