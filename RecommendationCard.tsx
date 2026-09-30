import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StepItem {
  step: number;
  title: string;
  description: string;
  timeline: string;
}

interface AIAdviceData {
  summary: string;
  credit_health_analysis: string;
  key_risks: string[];
  bottlenecks: string[];
  recommendations: string[];
  five_step_plan: StepItem[];
  short_term_goals?: string[];
  long_term_goals?: string[];
  disclaimer?: string;
  created_at?: string;
}

interface RecommendationCardProps {
  advice: AIAdviceData;
  onRefresh?: () => void;
  isAnalyzing?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  advice,
  onRefresh,
  isAnalyzing = false,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. AI Summary Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/20 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                AI Credit Advisor Summary
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by Google Gemini 3.8 Flash • Indian Financial Framework
              </p>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isAnalyzing}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors self-start sm:self-auto disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
            </button>
          )}
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-sans">{advice.summary}</p>

        {advice.credit_health_analysis && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {advice.credit_health_analysis}
          </div>
        )}
      </div>

      {/* 2. Risks and Bottlenecks 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Risk Factors */}
        <div className="p-5 bg-slate-900 border border-rose-500/20 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-rose-400 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Key Risk Factors</h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {advice.key_risks?.map((risk, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial Bottlenecks */}
        <div className="p-5 bg-slate-900 border border-amber-500/20 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-amber-400 mb-3">
            <Flame className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Financial Bottlenecks</h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {advice.bottlenecks?.map((bn, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{bn}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Actionable Recommendations */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 mb-4">
          <CheckCircle2 className="w-5 h-5" />
          <h4 className="text-sm font-bold tracking-wide text-white">
            Personalized Tactical Recommendations
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {advice.recommendations?.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start space-x-3"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-snug">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 5-Step Improvement Plan */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-blue-400">
            <Compass className="w-5 h-5" />
            <h4 className="text-sm font-bold tracking-wide text-white">
              5-Step Credit Health Improvement Roadmap
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Step-by-Step Blueprint</span>
        </div>

        <div className="space-y-3">
          {advice.five_step_plan?.map((stepItem) => (
            <div
              key={stepItem.step}
              className="p-4 bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/30 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  0{stepItem.step}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    {stepItem.title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end md:self-auto px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 text-[11px] text-slate-300 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{stepItem.timeline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Short-Term & Long-Term Goals */}
      {(advice.short_term_goals || advice.long_term_goals) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advice.short_term_goals && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5">
                Target 30–60 Day Milestones
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.short_term_goals.map((g, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {advice.long_term_goals && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5">
                Target 6–12 Month Horizon
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.long_term_goals.map((g, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. Regulatory Educational Disclaimer */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Educational Notice:</strong>{' '}
          {advice.disclaimer ||
            'AI advice is provided for educational and financial wellness planning purposes only. It does not constitute official lending underwriting, legal, or guaranteed financial advice under SEBI or RBI regulations.'}
        </p>
      </div>
    </div>
  );
};
