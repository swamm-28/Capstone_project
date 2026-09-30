import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Wallet,
  Sparkles,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  X,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { motion } from 'motion/react';

export type PageTab =
  | 'dashboard'
  | 'credit-health'
  | 'profile'
  | 'ai-advisor'
  | 'progress'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { logout } = useAuth();

  const navItems: Array<{
    id: PageTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'credit-health', label: 'Credit Health', icon: Activity },
    { id: 'profile', label: 'Financial Profile', icon: Wallet },
    {
      id: 'ai-advisor',
      label: 'AI Advisor',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
    { id: 'reports', label: 'Health Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: PageTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-250 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 md:px-5 border-b border-slate-800">
            <Logo size="sm" variant="full" showSubtitle={false} />
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with Motion Transitions */}
          <nav className="p-3.5 space-y-1 relative">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Financial Hub</span>
              <span className="text-[9px] text-blue-400 font-mono">v2.0</span>
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors group ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {/* Animated Active Sliding Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/25 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Left Cyan Indicator Glow Line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlowBar"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-300 rounded-r-full shadow-[0_0_8px_#38bdf8]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}

                  <div className="flex items-center space-x-3 z-10">
                    <span
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-white drop-shadow'
                          : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 z-10">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Indian Credit Bureau status & logout */}
        <div className="p-3.5 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>CIBIL Live Sync</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">₹ INR</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              30% utilization monitoring &amp; RBI compliance algorithms active.
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
