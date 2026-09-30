import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  PieChart,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

interface LandingProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateDemo: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onNavigateDemo,
}) => {
  const { loginWithDemo } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B1220]/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" variant="full" />

          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                await loginWithDemo();
                onNavigateDemo();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo</span>
            </button>

            <button
              onClick={onNavigateLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Login
            </button>

            <button
              onClick={onNavigateRegister}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/20 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Financial Wellness for the Indian Credit Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Understand Your Credit.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Improve Your Financial Future.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Monitor your CIBIL credit score, track credit utilization, calculate debt-to-income
            ratios, and receive bespoke AI consultation to unlock premier borrowing rates and debt freedom.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateRegister}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await loginWithDemo();
                onNavigateDemo();
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch Live Sample Profile</span>
            </button>
          </div>

          {/* Quick Metrics Teaser Banner */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Average User Jump</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">+45 pts</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across 90-day audits</p>
            </div>
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Ideal Utilization</p>
              <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">&le; 30%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">RBI & CIBIL benchmark</p>
            </div>
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">AI Advisory Engine</p>
              <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">Gemini 3.8</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Personalized roadmaps</p>
            </div>
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Audit Reports</p>
              <p className="text-2xl font-extrabold text-slate-200 font-mono mt-1">PDF Export</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ReportLab formatted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Comprehensive Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Everything Needed to Master Your Credit Health
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">CIBIL Score Progression</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your credit score journey over time with interactive Recharts line visualizations,
                automatic delta tracking, and milestone achievements.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Credit Utilization Radar</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze revolving card balance vs available limits in Indian Rupees. Keep your utilization
                under the optimal 30% threshold to avoid score penalties.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">AI-Powered Credit Consultation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leverage Google Gemini to analyze your exact debt, EMI obligations, and missed payments.
                Receive a tailored 5-step roadmap to prime credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">Simple Process</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            How DhanSetu Works
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl relative">
            <span className="text-3xl font-black text-blue-500/20 font-mono absolute top-3 right-4">
              01
            </span>
            <h5 className="font-bold text-white text-sm mt-3">Create Free Account</h5>
            <p className="text-xs text-slate-400 mt-2">
              Sign up securely with password hashing and JWT encrypted sessions.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl relative">
            <span className="text-3xl font-black text-blue-500/20 font-mono absolute top-3 right-4">
              02
            </span>
            <h5 className="font-bold text-white text-sm mt-3">Enter Financial Profile</h5>
            <p className="text-xs text-slate-400 mt-2">
              Input income, debt, card limits, active loans, and current credit score.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl relative">
            <span className="text-3xl font-black text-blue-500/20 font-mono absolute top-3 right-4">
              03
            </span>
            <h5 className="font-bold text-white text-sm mt-3">Consult AI Advisor</h5>
            <p className="text-xs text-slate-400 mt-2">
              Gemini analyzes bottlenecks, evaluates risks, and creates a 5-step roadmap.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl relative">
            <span className="text-3xl font-black text-blue-500/20 font-mono absolute top-3 right-4">
              04
            </span>
            <h5 className="font-bold text-white text-sm mt-3">Track &amp; Export PDF</h5>
            <p className="text-xs text-slate-400 mt-2">
              Watch your score improve and download comprehensive financial health reports.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Take Control of Your Credit Health Today
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Join thousands of smart borrowers optimizing their CIBIL score, reducing interest costs, and securing better financial terms.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onNavigateRegister}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Start Free Audit
            </button>
            <button
              onClick={async () => {
                await loginWithDemo();
                onNavigateDemo();
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-850 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">DHANSETU (धनसेतु) © 2026</p>
          <p className="max-w-2xl mx-auto text-[11px] text-slate-400 leading-relaxed">
            Educational Disclaimer: DhanSetu is an educational financial wellness platform. It is not an official credit bureau or lending institution and does not provide guaranteed loan approvals or legal credit repair under RBI regulations.
          </p>
        </div>
      </footer>
    </div>
  );
};
