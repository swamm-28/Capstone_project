import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Menu,
  ChevronDown,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  CreditCard,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTab } from './Sidebar';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  currentPageTitle?: string;
  onOpenSeedModal?: () => void;
  onNavigateTab?: (tab: PageTab) => void;
  onOpenUpdateScoreModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  currentPageTitle = 'dashboard',
  onOpenSeedModal,
  onNavigateTab,
  onOpenUpdateScoreModal,
}) => {
  const { user, logout, loginWithDemo } = useAuth();

  // Dropdown states
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isBureauMenuOpen, setIsBureauMenuOpen] = useState(false);

  // Selected Credit Bureau
  const [selectedBureau, setSelectedBureau] = useState({
    id: 'cibil',
    name: 'TransUnion CIBIL',
    code: 'CIBIL',
    scale: '300-900',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'Primary',
  });

  const bureaus = [
    {
      id: 'cibil',
      name: 'TransUnion CIBIL',
      code: 'CIBIL',
      scale: '300–900',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      badge: 'Primary (India)',
    },
    {
      id: 'experian',
      name: 'Experian India',
      code: 'EXPERIAN',
      scale: '300–900',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      badge: 'Tier 1 Bureau',
    },
    {
      id: 'equifax',
      name: 'Equifax Credit Score',
      code: 'EQUIFAX',
      scale: '300–850',
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      badge: 'RBI Registered',
    },
    {
      id: 'crif',
      name: 'CRIF High Mark',
      code: 'CRIF',
      scale: '300–900',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'Retail Bureau',
    },
  ];

  // Click outside handlers
  const profileRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const bureauRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (bureauRef.current && !bureauRef.current.contains(e.target as Node)) {
        setIsBureauMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (tab: PageTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    setIsProfileMenuOpen(false);
    setIsActionsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-sm">
      {/* Left: Mobile Toggle & Attractive DhanSetu Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => handleNav('dashboard')}
          className="cursor-pointer"
          title="DhanSetu (धनसेतु) - AI Credit Health Platform"
        >
          <Logo size="md" variant="full" />
        </div>
      </div>

      {/* Center: Bureau Dropdown Selector (Desktop) */}
      <div className="hidden lg:flex items-center space-x-2" ref={bureauRef}>
        <div className="relative">
          <button
            onClick={() => {
              setIsBureauMenuOpen(!isBureauMenuOpen);
              setIsProfileMenuOpen(false);
              setIsActionsMenuOpen(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-950 shadow-inner group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-normal">Bureau Model:</span>
            <span className={`font-bold ${selectedBureau.color}`}>{selectedBureau.code}</span>
            <span className="text-[10px] text-slate-400 font-mono">({selectedBureau.scale})</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isBureauMenuOpen ? 'rotate-180 text-blue-400' : ''
              }`}
            />
          </button>

          {/* Bureau Dropdown Menu */}
          <AnimatePresence>
            {isBureauMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
              >
                <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                  <span>Authorized Indian Credit Bureaus</span>
                  <span className="text-blue-400">RBI Regulated</span>
                </div>
                <div className="py-1 space-y-1">
                  {bureaus.map((b) => {
                    const isSelected = selectedBureau.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBureau(b);
                          setIsBureauMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border border-blue-500/30 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-blue-400' : 'bg-slate-600'
                            }`}
                          />
                          <div className="text-left">
                            <p className="font-semibold text-white">{b.name}</p>
                            <p className="text-[10px] text-slate-400">Scale: {b.scale}</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {b.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Controls & Dropdowns */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Actions Dropdown Menu */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => {
              setIsActionsMenuOpen(!isActionsMenuOpen);
              setIsProfileMenuOpen(false);
              setIsBureauMenuOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-xl hover:bg-blue-500/20 transition-all shadow-sm group"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Quick Actions</span>
            <span className="sm:hidden">Actions</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${
                isActionsMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Quick Actions Dropdown Content */}
          <AnimatePresence>
            {isActionsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
              >
                <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Fast Utilities</span>
                  <span className="text-amber-400 text-[9px] font-mono">Instant</span>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      if (onOpenUpdateScoreModal) {
                        onOpenUpdateScoreModal();
                      } else {
                        handleNav('dashboard');
                      }
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Record CIBIL Score</p>
                      <p className="text-[10px] text-slate-400">Log new bureau check result</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNav('ai-advisor')}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Ask AI Financial Copilot</p>
                      <p className="text-[10px] text-slate-400">Generate 5-step debt roadmap</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNav('reports')}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Download PDF Report</p>
                      <p className="text-[10px] text-slate-400">Generate audit-ready document</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNav('credit-health')}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Utilization Check</p>
                      <p className="text-[10px] text-slate-400">Analyze 30% card limit rule</p>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={async () => {
                      setIsActionsMenuOpen(false);
                      if (onOpenSeedModal) {
                        onOpenSeedModal();
                      } else {
                        await loginWithDemo();
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Seed Demo Profile</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-400">₹75k • 735</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 1-Click Demo Seed Button */}
        <button
          onClick={async () => {
            if (onOpenSeedModal) {
              onOpenSeedModal();
            } else {
              await loginWithDemo();
            }
          }}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl hover:bg-amber-500/20 transition-all shadow-sm"
          title="Seed realistic Indian credit data (690->735 CIBIL, ₹75,000 income)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Demo Data</span>
        </button>

        {/* User Profile & Account Dropdown Menu */}
        {user ? (
          <div className="relative pl-1 border-l border-slate-800" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsActionsMenuOpen(false);
                setIsBureauMenuOpen(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-all focus:outline-none group border border-transparent hover:border-slate-700"
              aria-label="User Account Menu"
            >
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-600/30">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'D'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>

              <div className="hidden lg:block text-left pr-1">
                <p className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                  <span>{user.full_name}</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-white ${
                  isProfileMenuOpen ? 'rotate-180 text-blue-400' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Content */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl"
                >
                  {/* Account Header */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Account Type:</span>
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        DhanSetu Prime
                      </span>
                    </div>
                  </div>

                  {/* Navigation Items in Dropdown */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left"
                    >
                      <UserIcon className="w-4 h-4 text-blue-400" />
                      <span>Financial Profile &amp; Income</span>
                    </button>

                    <button
                      onClick={() => handleNav('credit-health')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left"
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>CIBIL &amp; Bureau Analytics</span>
                    </button>

                    <button
                      onClick={() => handleNav('ai-advisor')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>AI Financial Advisor</span>
                    </button>

                    <button
                      onClick={() => handleNav('reports')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Audit Reports &amp; Downloads</span>
                    </button>

                    <button
                      onClick={() => handleNav('settings')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  {/* Divider and Sign Out */}
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from DhanSetu</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <a
              href="#login"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
