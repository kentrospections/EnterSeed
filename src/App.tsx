import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell, ActivePage } from './components/AppShell';

import { DashboardView } from './views/DashboardView';
import { FinanceView } from './views/FinanceView';
import { MarketingView } from './views/MarketingView';
import { DocumentsView } from './views/DocumentsView';
import { BossNanaView } from './views/BossNanaView';
import { EfilingView } from './views/EfilingView';
import { PricingView } from './views/PricingView';
import { AboutView } from './views/AboutView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { ArrowLeft, Sparkles } from 'lucide-react';

const protectedPages: ActivePage[] = [
  'dashboard',
  'finance',
  'marketing',
  'documents',
  'boss-nana'
];

const MainRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const hash = window.location.hash.replace('#', '') as ActivePage;
    if (hash && [
      'dashboard', 'finance', 'marketing', 'documents', 'boss-nana',
      'efiling', 'pricing', 'about', 'admin', 'login', 'register'
    ].includes(hash)) {
      return hash;
    }
    return 'login';
  });

  // Keep hash in sync with active page
  useEffect(() => {
    window.location.hash = activePage;
  }, [activePage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActivePage;
      if (hash) setActivePage(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If user is not logged in and attempts to access protected workspace routes, redirect to login
  useEffect(() => {
    if (!loading && !user && protectedPages.includes(activePage)) {
      setActivePage('login');
    }
  }, [user, loading, activePage]);

  // If user is already logged in and navigates to login or register, redirect to dashboard
  useEffect(() => {
    if (!loading && user && (activePage === 'login' || activePage === 'register')) {
      setActivePage('dashboard');
    }
  }, [user, loading, activePage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F1] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4A1D8F] to-[#FF8A3D] p-3 shadow-lg flex items-center justify-center animate-pulse mb-4">
          <img src="/logos/Icon White.png" alt="Enterseed" className="w-8 h-8 object-contain" />
        </div>
        <p className="text-xs font-bold text-[#4A1D8F] tracking-wider uppercase">Loading Enterseed…</p>
      </div>
    );
  }

  // 1. Standalone Login / Registration Pages (Separated from workspace)
  if (!user && (activePage === 'login' || activePage === 'register')) {
    return <AuthView initialMode={activePage} setActivePage={setActivePage} />;
  }

  // 2. Unauthenticated views of public pages (e.g. About, Pricing, E-Filing, Admin) with a clean public header
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF7F1] flex flex-col">
        {/* Simple Public Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E9D9EF] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setActivePage('login')}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4A1D8F] to-[#FF8A3D] p-1.5 flex items-center justify-center shadow-xs">
              <img src="/logos/Icon White.png" alt="Enterseed" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-extrabold text-lg text-[#4A1D8F]">Enterseed</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#4A1D8F] hover:bg-[#F1EAF8] px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
            <button
              onClick={() => setActivePage('register')}
              className="text-xs font-bold text-white bg-[#4A1D8F] hover:bg-[#2C154F] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              Create Account
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
          {activePage === 'pricing' && <PricingView />}
          {activePage === 'about' && <AboutView />}
          {activePage === 'efiling' && <EfilingView />}
          {activePage === 'admin' && <AdminView />}
        </main>
      </div>
    );
  }

  // 3. Authenticated Workspace (Wrapped in AppShell with Sidebar, Topbar, and Dashboard)
  const renderWorkspaceContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView setActivePage={setActivePage} />;
      case 'finance':
        return <FinanceView />;
      case 'marketing':
        return <MarketingView />;
      case 'documents':
        return <DocumentsView />;
      case 'boss-nana':
        return <BossNanaView />;
      case 'efiling':
        return <EfilingView />;
      case 'pricing':
        return <PricingView />;
      case 'about':
        return <AboutView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView setActivePage={setActivePage} />;
    }
  };

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {renderWorkspaceContent()}
    </AppShell>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
