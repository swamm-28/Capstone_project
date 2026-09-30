import React, { useState, useEffect } from 'react';
import { dashboardService, aiService, formatINR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditScoreCard } from '../components/CreditScoreCard';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { UtilizationChart } from '../components/UtilizationChart';
import { ScoreHistoryChart } from '../components/ScoreHistoryChart';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingSpinner, CardSkeleton } from '../components/LoadingSpinner';
import { UpdateScoreModal } from '../components/UpdateScoreModal';
import {
  Sparkles,
  CreditCard,
  Percent,
  Calendar,
  Layers,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenOnboarding: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, onOpenOnboarding }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dropdown States
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [selectedScenario, setSelectedScenario] = useState<string>('baseline');
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);

  const scenarios = [
    {
      id: 'baseline',
      title: 'Current Baseline (Live CIBIL)',
      pts: '+0',
      description: 'Active credit score progression and recorded accounts.',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'debt_reduction',
      title: 'Clear ₹50,000 Card Debt',
      pts: '+24 pts',
      description: 'Lowers utilization below 25%, drastically improving revolving balance risk.',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'dti_optimize',
      title: 'Optimize DTI Headroom (<20%)',
      pts: '+38 pts',
      description: 'Increases unencumbered monthly disposable cash flow for lending underwriting.',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'zero_default_12m',
      title: '12 Months 100% On-Time EMIs',
      pts: '+55 pts',
      description: 'Builds highest tier repayment track record with zero DPD (Days Past Due).',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        onOpenOnboarding();
      } else {
        setError(err.response?.data?.detail || 'Failed to load dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await aiService.analyzeCredit();
      setData((prev: any) => ({
        ...prev,
        latest_ai_advice: res.data,
      }));
    } catch (err: any) {
      alert('AI Consultation failed: ' + (err.response?.data?.detail || 'Network error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const analytics = data?.analytics;
  const latestAi = data?.latest_ai_advice;

  if (!profile) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 bg-slate-900 border border-slate-800 rounded-2xl my-12">
        <CreditCard className="w-12 h-12 text-blue-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Financial Profile Found</h3>
        <p className="text-xs text-slate-400">
          Complete your initial onboarding profile to unlock CIBIL calculations, utilization tracking, and AI guidance.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Initialize Profile Now
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Welcome, {user?.full_name || 'Borrower'}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Member
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial wellness snapshot aligned with TransUnion CIBIL standards.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Update Score</span>
          </button>

          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Consulting Gemini...' : 'Analyze My Credit Health'}</span>
          </button>
        </div>
      </div>

      {/* Dropdown Options & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Horizon Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTimeDropdownOpen(!isTimeDropdownOpen);
                setIsScenarioDropdownOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 font-normal">Range:</span>
              <span className="font-bold text-white uppercase">{timeRange}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isTimeDropdownOpen ? 'rotate-180 text-blue-400' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isTimeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 z-30"
                >
                  {[
                    { id: '3m', label: 'Last 3 Months' },
                    { id: '6m', label: 'Last 6 Months (Active)' },
                    { id: '1y', label: 'Last 1 Year' },
                    { id: 'all', label: 'Full Historical Audit' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTimeRange(t.id as any);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        timeRange === t.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{t.label}</span>
                      {timeRange === t.id && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* What-If Simulator Scenario Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsScenarioDropdownOpen(!isScenarioDropdownOpen);
                setIsTimeDropdownOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-normal">Scenario Simulator:</span>
              <span className="font-bold text-amber-300 truncate max-w-[140px] sm:max-w-none">
                {scenarios.find((s) => s.id === selectedScenario)?.title}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isScenarioDropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isScenarioDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-30"
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Interactive What-If Projections
                  </div>
                  <div className="py-1 space-y-1">
                    {scenarios.map((sc) => {
                      const isSelected = selectedScenario === sc.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => {
                            setSelectedScenario(sc.id);
                            setIsScenarioDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border border-amber-500/30'
                              : 'hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{sc.title}</span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sc.badgeColor}`}
                            >
                              {sc.pts}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            {sc.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Bureau Status Pill */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Bureau: <strong className="text-white">TransUnion CIBIL</strong></span>
        </div>
      </div>

      {/* Simulator Active Notification Banner */}
      {selectedScenario !== 'baseline' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3.5 bg-gradient-to-r from-amber-950/40 via-blue-950/40 to-slate-900 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <p className="font-bold text-white">
                Simulated Impact: {scenarios.find((s) => s.id === selectedScenario)?.title}
              </p>
              <p className="text-[11px] text-slate-300">
                {scenarios.find((s) => s.id === selectedScenario)?.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {scenarios.find((s) => s.id === selectedScenario)?.pts} Projection
            </span>
          </div>
        </motion.div>
      )}

      {/* Row 1: Primary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* A. Credit Score Card */}
        <CreditScoreCard
          currentScore={analytics?.current_score || profile.current_credit_score}
          previousScore={analytics?.previous_score}
          delta={analytics?.delta || 0}
          status={analytics?.score_status || profile.health_status}
          onUpdateScore={() => setIsUpdateModalOpen(true)}
        />

        {/* B. Financial Health Score */}
        <FinancialHealthCard
          healthScore={analytics?.financial_health_score || profile.financial_health_score}
          status={analytics?.health_status || profile.health_status}
          creditUtilization={analytics?.credit_utilization || profile.credit_utilization}
          dtiRatio={analytics?.dti_ratio || profile.dti_ratio}
          missedPayments={profile.missed_payments}
        />

        {/* C. Quick Stats Card: DTI & Income */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Debt-To-Income (DTI)
              </span>
              <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-4xl font-extrabold text-white font-mono">
                {analytics?.dti_ratio || profile.dti_ratio}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  (analytics?.dti_ratio || profile.dti_ratio) <= 35
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {(analytics?.dti_ratio || profile.dti_ratio) <= 35 ? 'Healthy' : 'Elevated'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Gross Income:</span>
              <span className="font-semibold text-white font-mono">
                {formatINR(profile.monthly_income)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Monthly EMIs/Outgo:</span>
              <span className="font-semibold text-slate-300 font-mono">
                {formatINR(profile.monthly_expenses)}
              </span>
            </div>
          </div>
        </div>

        {/* D. Quick Stats Card: Active Loans & Defaults */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Facilities
              </span>
              <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Loans</p>
                <p className="text-3xl font-extrabold text-white font-mono">{profile.active_loans}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Missed Dues</p>
                <p
                  className={`text-3xl font-extrabold font-mono ${
                    profile.missed_payments === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {profile.missed_payments}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Total Debt Burden:</span>
            <span className="font-bold text-white font-mono">{formatINR(profile.total_debt)}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Score History & Utilization Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScoreHistoryChart
            data={analytics?.score_history || []}
            currentScore={analytics?.current_score}
          />
        </div>
        <div className="lg:col-span-1">
          <UtilizationChart
            creditLimit={profile.credit_limit}
            creditUtilization={analytics?.credit_utilization || profile.credit_utilization}
            usedCredit={analytics?.used_credit}
            availableCredit={analytics?.available_credit}
          />
        </div>
      </div>

      {/* Row 3 & 4: AI Recommendations & 5-Step Improvement Plan */}
      {latestAi ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>AI Credit Health Consultation</span>
            </h3>
            <button
              onClick={() => onNavigateTab('ai-advisor')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Full AI Advisor Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RecommendationCard
            advice={latestAi}
            onRefresh={handleRunAIAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-br from-slate-900 to-blue-950/30 border border-slate-800 rounded-2xl text-center space-y-3">
          <Sparkles className="w-10 h-10 text-blue-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Generate Your AI Credit Consultation</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Analyze bottlenecks in your Indian credit report, detect high risk utilization, and receive a customized 5-step roadmap powered by Gemini.
          </p>
          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {isAnalyzing ? 'Consulting Gemini...' : 'Analyze My Credit Health'}
          </button>
        </div>
      )}

      {/* Update Score Modal */}
      <UpdateScoreModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentScore={analytics?.current_score || profile.current_credit_score}
        onScoreUpdated={fetchDashboardData}
      />
    </div>
  );
};
