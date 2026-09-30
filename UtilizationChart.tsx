import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../services/api';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';

interface UtilizationChartProps {
  creditLimit: number;
  creditUtilization: number;
  usedCredit?: number;
  availableCredit?: number;
}

export const UtilizationChart: React.FC<UtilizationChartProps> = ({
  creditLimit = 400000,
  creditUtilization = 37.5,
  usedCredit,
  availableCredit,
}) => {
  const calculatedUsed = usedCredit !== undefined ? usedCredit : (creditUtilization / 100) * creditLimit;
  const calculatedAvail =
    availableCredit !== undefined ? availableCredit : Math.max(0, creditLimit - calculatedUsed);

  const data = [
    { name: 'Used Credit', value: Math.round(calculatedUsed), color: '#3B82F6' },
    { name: 'Available Credit', value: Math.round(calculatedAvail), color: '#1E293B' },
  ];

  const getStatus = (util: number) => {
    if (util <= 30) return { label: 'Low (Optimal)', color: 'text-emerald-400 bg-emerald-500/10' };
    if (util <= 50) return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10' };
    return { label: 'High Risk', color: 'text-rose-400 bg-rose-500/10' };
  };

  const status = getStatus(creditUtilization);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <PieIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Credit Utilization
            </h3>
            <p className="text-[11px] text-slate-400">Limit: {formatINR(creditLimit)}</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Donut Chart Container */}
      <div className="relative h-48 w-full flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any) => [formatINR(Number(value)), '']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="#0F172A"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-white font-mono">{creditUtilization}%</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Utilized</span>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-blue-400 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Used Credit</span>
          </div>
          <p className="font-bold text-white font-mono text-sm mt-1">{formatINR(calculatedUsed)}</p>
          <span className="text-[10px] text-slate-400">{creditUtilization}% of limit</span>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Available</span>
          </div>
          <p className="font-bold text-slate-200 font-mono text-sm mt-1">{formatINR(calculatedAvail)}</p>
          <span className="text-[10px] text-slate-400">
            {Math.max(0, Math.round(100 - creditUtilization))}% buffer
          </span>
        </div>
      </div>

      {creditUtilization > 30 && (
        <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Reducing under 30% ({formatINR(creditLimit * 0.3)}) boosts score faster.</span>
        </div>
      )}
    </div>
  );
};
