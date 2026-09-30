import React, { useState, useEffect } from 'react';
import { financialService, formatINR } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Wallet,
  Save,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  CreditCard,
  Layers,
  Award,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [debt, setDebt] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [utilization, setUtilization] = useState<number>(0);
  const [loans, setLoans] = useState<number>(0);
  const [missed, setMissed] = useState<number>(0);
  const [score, setScore] = useState<number>(650);

  const fetchProfile = async () => {
    try {
      const res = await financialService.getProfile();
      const p = res.data;
      setProfile(p);
      setIncome(p.monthly_income);
      setExpenses(p.monthly_expenses);
      setDebt(p.total_debt);
      setCreditLimit(p.credit_limit);
      setUtilization(p.credit_utilization);
      setLoans(p.active_loans);
      setMissed(p.missed_payments);
      setScore(p.current_credit_score);
    } catch (err: any) {
      setErrorMsg('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Live Auto-calculated DTI
  const liveDti =
    income > 0 ? Math.min(100, Math.round(((expenses / income) * 100) * 10) / 10) : 0;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await financialService.updateProfile({
        monthly_income: Number(income),
        monthly_expenses: Number(expenses),
        total_debt: Number(debt),
        credit_limit: Number(creditLimit),
        credit_utilization: Number(utilization),
        active_loans: Number(loans),
        missed_payments: Number(missed),
        current_credit_score: Number(score),
      });

      setProfile(res.data);
      setSuccessMsg('Financial profile updated! Real-time health metrics recalculated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update financial profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Financial Profile..." />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Wallet className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-extrabold text-white">Financial Profile &amp; Liabilities</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Keep your debt, incomes, and credit limits up to date to maintain accurate real-time analytics.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recalculation Alert */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Live Recalculation Engine</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            When you lower debt or decrease utilization, your DTI and Financial Health Score automatically update.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0 text-xs">
          <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Current Health: </span>
            <span className="font-bold text-emerald-400 font-mono">
              {profile?.financial_health_score}/100
            </span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Status: </span>
            <span className="font-bold text-white">{profile?.health_status}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800">
            Earnings &amp; Recurring Obligations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Monthly Gross Income (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={income}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-3 top-3 text-xs text-slate-400">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{formatINR(income)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Monthly Expenses &amp; EMI Outgo (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={expenses}
                  onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-3 top-3 text-xs text-slate-400">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatINR(expenses)} (DTI: {liveDti}%)
              </span>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pt-4 pb-2 border-b border-slate-800">
            Credit Facilities, Cards &amp; Debts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Outstanding Debt (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={debt}
                  onChange={(e) => setDebt(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-3 top-3 text-xs text-slate-400">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Loans + card balances: {formatINR(debt)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Credit Facility Limit (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-3 top-3 text-xs text-slate-400">₹</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Max cards limit: {formatINR(creditLimit)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Credit Utilization Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={utilization}
                onChange={(e) => setUtilization(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Used credit = {formatINR((utilization / 100) * creditLimit)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Active Loan Accounts
              </label>
              <input
                type="number"
                min="0"
                required
                value={loans}
                onChange={(e) => setLoans(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Personal, auto, home loan accounts
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Missed / Late Payments (Past 24m)
              </label>
              <input
                type="number"
                min="0"
                required
                value={missed}
                onChange={(e) => setMissed(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Defaults reported to bureaus
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Current CIBIL / Credit Score (300 – 900)
              </label>
              <input
                type="number"
                min="300"
                max="900"
                required
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value, 10) || 300)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Status:{' '}
                {score >= 750
                  ? 'Excellent'
                  : score >= 700
                  ? 'Good'
                  : score >= 650
                  ? 'Fair'
                  : 'Needs Attention'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Financial Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
