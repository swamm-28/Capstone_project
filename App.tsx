import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageTab } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { CreditHealth } from './pages/CreditHealth';
import { Profile } from './pages/Profile';
import { AIAdvisor } from './pages/AIAdvisor';
import { Progress } from './pages/Progress';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { LoadingSpinner } from './components/LoadingSpinner';
import { financialService } from './services/api';
import { motion, AnimatePresence } from 'motion/react';

type AuthView = 'landing' | 'login' | 'register' | 'onboarding';

const MainApp: React.FC = () => {
  const { user, loading, loginWithDemo } = useAuth();

  const [authView, setAuthView] = useState<AuthView>('landing');
  const [currentTab, setCurrentTab] = useState<PageTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Check if authenticated user already has a financial profile
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        setCheckingProfile(true);
        try {
          await financialService.getProfile();
          setHasProfile(true);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setHasProfile(false);
          } else {
            setHasProfile(true);
          }
        } finally {
          setCheckingProfile(false);
        }
      } else {
        setHasProfile(null);
      }
    };

    checkUserProfile();
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <LoadingSpinner message="Initializing DhanSetu..." size="lg" />
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    if (authView === 'login') {
      return (
        <Login
          onNavigateRegister={() => setAuthView('register')}
          onLoginSuccess={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <Register
          onNavigateLogin={() => setAuthView('login')}
          onRegisterSuccess={() => setAuthView('onboarding')}
        />
      );
    }
    return (
      <Landing
        onNavigateLogin={() => setAuthView('login')}
        onNavigateRegister={() => setAuthView('register')}
        onNavigateDemo={() => {
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // If user is logged in but hasn't entered financial parameters
  if (hasProfile === false || authView === 'onboarding') {
    return (
      <Onboarding
        onComplete={() => {
          setHasProfile(true);
          setAuthView('landing');
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // Authenticated Main Workspace Layout
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenOnboarding={() => setHasProfile(false)}
          />
        );
      case 'credit-health':
        return <CreditHealth />;
      case 'profile':
        return <Profile />;
      case 'ai-advisor':
        return <AIAdvisor />;
      case 'progress':
        return <Progress />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenOnboarding={() => setHasProfile(false)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col font-sans">
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentPageTitle={currentTab}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenSeedModal={async () => {
          await loginWithDemo();
          setHasProfile(true);
          setCurrentTab('dashboard');
        }}
      />

      {/* Mobile/Tablet Horizontal Animated Tab Strip */}
      <div className="md:hidden flex items-center space-x-1 px-3 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'credit-health', label: 'Health' },
          { id: 'ai-advisor', label: 'AI Copilot' },
          { id: 'profile', label: 'Profile' },
          { id: 'progress', label: 'Progress' },
          { id: 'reports', label: 'Reports' },
          { id: 'settings', label: 'Settings' },
        ].map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id as PageTab)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-[#0B1220] min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
