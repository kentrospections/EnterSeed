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

const MainRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && [
      'dashboard', 'finance', 'marketing', 'documents', 'boss-nana',
      'efiling', 'pricing', 'about', 'admin', 'login', 'register'
    ].includes(hash)) {
      return hash as ActivePage;
    }
    return 'dashboard';
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

  const renderContent = () => {
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
      case 'login':
        return <AuthView initialMode="login" setActivePage={setActivePage} />;
      case 'register':
        return <AuthView initialMode="register" setActivePage={setActivePage} />;
      default:
        return <DashboardView setActivePage={setActivePage} />;
    }
  };

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
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
