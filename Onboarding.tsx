import React, { useState, useEffect } from 'react';
import { financialService, formatINR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();

  const [monthlyIncome, setMonthlyIncome] = useState<number>(75000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(42000);
  const [totalDebt, setTotalDebt] = useState<number>(250000);
  const [creditLimit, setCreditLimit] = useState<number>(400000);
  const [activeLoans, setActiveLoans] = useState<number>(2);
  const [missedPayments, setMissedPayments] = useState<number>(0);
  const [creditScore, setCreditScore] = useState<number>(735);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Auto-calculated values
  const dti =
    monthlyIncome > 0
      ? Math.min(100, Math.round(((monthlyExpenses / monthlyIncome) * 100) * 10) / 10)
      : 0;

  const calculatedUtilization =
    creditLimit > 0
      ? Math.min(100, Math.round(((totalDebt / creditLimit) * 100) * 10) / 10)
      : 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creditScore < 300 || creditScore > 900) {
      setError('CIBIL Credit Score must be between 300 and 900.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await financialService.createProfile({
        monthly_income: Number(monthlyIncome),
        monthly_expenses: Number(monthlyExpenses),
        total_debt: Number(totalDebt),
        credit_limit: Number(creditLimit),
        credit_utilization: calculatedUtilization,
        active_loans: Number(activeLoans),
        missed_payments: Number(missedPayments),
        current_credit_score: Number(creditScore),
      });
      onComplete();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to initialize financial profile. Please verify fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] py-12 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
          <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Initialize Your Financial Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Welcome, <span className="text-white font-semibold">{user?.full_name}</span>. Provide
              your baseline parameters to activate your personalized credit dashboard.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Monthly Income */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Monthly Gross Income (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatINR(monthlyIncome)} per month
              </span>
            </div>

            {/* Monthly Expenses */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Monthly Expenses &amp; EMIs (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatINR(monthlyExpenses)} recurring obligations
              </span>
            </div>

            {/* Total Debt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Outstanding Debt (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={totalDebt}
                  onChange={(e) => setTotalDebt(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatINR(totalDebt)} cumulative liability
              </span>
            </div>

            {/* Total Credit Limit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Credit Cards Limit (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatINR(creditLimit)} total borrowing ceiling
              </span>
            </div>

            {/* Active Loans */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Active Loan Accounts
              </label>
              <input
                type="number"
                min="0"
                value={activeLoans}
                onChange={(e) => setActiveLoans(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Personal, home, auto, education loans
              </span>
            </div>

            {/* Missed Payments */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Missed / Late Payments (Past 24m)
              </label>
              <input
                type="number"
                min="0"
                value={missedPayments}
                onChange={(e) => setMissedPayments(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Instances where payment exceeded due date
              </span>
            </div>

            {/* Current CIBIL / Credit Score */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Current CIBIL / Credit Score (300 – 900)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="300"
                  max="900"
                  required
                  value={creditScore}
                  onChange={(e) => setCreditScore(parseInt(e.target.value, 10) || 650)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-extrabold text-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute right-4 top-3.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {creditScore >= 750
                    ? 'Excellent'
                    : creditScore >= 700
                    ? 'Good'
                    : creditScore >= 650
                    ? 'Fair'
                    : 'Needs Attention'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Automated Financial Metrics Preview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Debt-to-Income (DTI)</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{dti}%</p>
                <span className={`text-[10px] font-semibold ${dti <= 35 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dti <= 35 ? 'Healthy Range' : 'Elevated'}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Utilization</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">
                  {calculatedUtilization}%
                </p>
                <span
                  className={`text-[10px] font-semibold ${
                    calculatedUtilization <= 30 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {calculatedUtilization <= 30 ? 'Optimal (<=30%)' : 'High Penalty Risk'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Repayment Track</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">
                  {missedPayments === 0 ? 'Pristine' : `${missedPayments} Def.`}
                </p>
                <span
                  className={`text-[10px] font-semibold ${
                    missedPayments === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {missedPayments === 0 ? 'Zero DPDS' : 'Score Impacted'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Initializing Profile...' : 'Save & Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
