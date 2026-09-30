import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  AlertCircle,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AIAdvisor: React.FC = () => {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    try {
      const res = await aiService.getRecommendations();
      setAdvice(res.data);
    } catch (err: any) {
      // not critical if not yet analyzed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await aiService.analyzeCredit();
      setAdvice(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'AI analysis consultation failed. Please verify network and try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Connecting to Gemini Credit Advisor..." />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Bot className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">AI Credit Advisor</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Get personalized financial insights based on your verified financial profile.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Consulting Gemini Engine...' : 'Analyze My Credit Health'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="flex items-center space-x-1 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Analyzing Pulse Overlay if in progress */}
      {analyzing && (
        <div className="p-12 bg-slate-900 border border-blue-500/30 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">
            Gemini is Evaluating Your Indian Credit Health
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Reviewing monthly income vs expenses, credit card utilization ratios, debt avalanche opportunities, and 5-step milestone planning...
          </p>
        </div>
      )}

      {!analyzing && advice && (
        <RecommendationCard advice={advice} onRefresh={handleRunAnalysis} isAnalyzing={analyzing} />
      )}

      {!analyzing && !advice && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-6">
          <BrainCircuit className="w-14 h-14 text-blue-400 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">No Consultation Stored Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the button below to prompt Google Gemini. The AI engine will audit your profile,
            diagnose credit bottlenecks, and assemble a tailored 5-step roadmap.
          </p>
          <button
            onClick={handleRunAnalysis}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Run Credit Analysis Now
          </button>
        </div>
      )}
    </div>
  );
};
