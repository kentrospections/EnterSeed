import React, { useState } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BossNarraWidget } from './BossNarraWidget';
import { OnboardingModal } from './OnboardingModal';
import {
  LayoutDashboard,
  Coins,
  TrendingUp,
  FileText,
  Bot,
  FileCheck2,
  Tag,
  Info,
  ShieldCheck,
  LogOut,
  Globe,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Building2,
  UserCheck
} from 'lucide-react';

export type ActivePage =
  | 'dashboard'
  | 'finance'
  | 'marketing'
  | 'documents'
  | 'boss-nana'
  | 'efiling'
  | 'pricing'
  | 'about'
  | 'admin'
  | 'login'
  | 'register';

interface AppShellProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activePage,
  setActivePage,
  children
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout, setQuickDemoUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { id: 'dashboard' as ActivePage, label: t('appShell.dashboard'), icon: LayoutDashboard, badge: '' },
    { id: 'finance' as ActivePage, label: t('appShell.finance'), icon: Coins, badge: '' },
    { id: 'marketing' as ActivePage, label: t('appShell.marketing'), icon: TrendingUp, badge: '' },
    { id: 'documents' as ActivePage, label: t('appShell.documents'), icon: FileText, badge: '' },
    { id: 'boss-nana' as ActivePage, label: t('appShell.bossNana'), icon: Bot, badge: 'AI' },
  ];

  const publicNavItems = [
    { id: 'efiling' as ActivePage, label: 'E-Filing & Readiness', icon: FileCheck2 },
    { id: 'pricing' as ActivePage, label: 'Pricing & Subsidy', icon: Tag },
    { id: 'about' as ActivePage, label: 'About & Support', icon: Info },
    { id: 'admin' as ActivePage, label: 'Staff Console', icon: ShieldCheck },
  ];

  const getBreadcrumbTitle = () => {
    switch (activePage) {
      case 'dashboard': return t('appShell.dashboard');
      case 'finance': return `${t('appShell.finance')} / ${t('appShell.financeBreadcrumb')}`;
      case 'marketing': return `${t('appShell.marketing')} / ${t('appShell.marketingBreadcrumb')}`;
      case 'documents': return `${t('appShell.documents')} / ${t('appShell.documentsBreadcrumb')}`;
      case 'boss-nana': return `${t('appShell.bossNana')} / ${t('appShell.assistantBreadcrumb')}`;
      case 'efiling': return 'E-Filing / Readiness Assessment';
      case 'pricing': return 'Pricing & Shipping Subsidy';
      case 'about': return 'About & Support Inquiries';
      case 'admin': return 'Staff Review Console';
      case 'login': return 'Sign In';
      case 'register': return 'Create Account';
      default: return 'Workspace';
    }
  };

  const handleOpenBossNarra = () => {
    window.dispatchEvent(new CustomEvent('open-boss-nana'));
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fil', label: 'Filipino' },
    { code: 'hil', label: 'Hiligaynon' }
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex flex-col md:flex-row">
      <OnboardingModal />

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#2B1C33] text-white flex-col flex-shrink-0 border-r border-[#4A1D8F]/20 relative z-20">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A1D8F] to-[#FF8A3D] p-2 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <img src="./logos/Icon White.png" alt="Enterseed Icon" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">Enterseed</span>
              <span className="text-[10px] text-[#FFD166] uppercase tracking-wider font-semibold">South Cotabato MSME</span>
            </div>
          </button>
        </div>

        {/* Workspace Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9D9EF]/50 px-3 block mb-2">
              MSME Workspace
            </span>
            <nav className="space-y-1.5" aria-label="Primary navigation">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-[#4A1D8F] text-white shadow-md font-semibold'
                        : 'text-[#E9D9EF]/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD166]' : 'text-[#E9D9EF]/70'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FF8A3D] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9D9EF]/50 px-3 block mb-2">
              Public Tools & Reviews
            </span>
            <nav className="space-y-1.5">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#4A1D8F]/60 text-white font-semibold'
                        : 'text-[#E9D9EF]/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#E9D9EF]/60" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Note */}
        <div className="p-4 border-t border-white/10 text-xs text-[#E9D9EF]/60 bg-black/20">
          <p className="leading-snug">{t('appShell.sidebarNote')}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#FFD166]">
            <span>SOCCSKSARGEN Region</span>
            <span className="w-2 h-2 rounded-full bg-[#76A13C]" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E9D9EF] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          {/* Mobile menu button and Brand */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4A1D8F] hover:bg-[#F1EAF8] rounded-xl"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="md:hidden flex items-center gap-2"
            >
              <img src="./logos/Icon.png" alt="Enterseed" className="w-7 h-7 object-contain" />
              <span className="font-extrabold text-lg text-[#4A1D8F]">Enterseed</span>
            </button>

            {/* Desktop Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-xs text-[#6F5B77]" aria-label="Breadcrumbs">
              <span className="font-bold text-[#4A1D8F]">Enterseed</span>
              <span>›</span>
              <span className="font-medium text-[#2B1C33]">{getBreadcrumbTitle()}</span>
            </nav>
          </div>

          {/* Right Topbar Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Ask Boss Narra CTA Button */}
            <button
              onClick={handleOpenBossNarra}
              className="flex items-center gap-2 bg-[#FFF0E4] hover:bg-[#FFE3CF] text-[#F26430] border border-[#FF8A3D]/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span className="hidden sm:inline">{t('appShell.askBossNana')}</span>
              <span className="sm:hidden">Boss Narra</span>
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2B1C33] bg-[#F1EAF8] hover:bg-[#E9D9EF] rounded-xl border border-[#D8C6F0] transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-[#4A1D8F]" />
                <span className="uppercase text-[11px] font-bold">{language}</span>
                <ChevronDown className="w-3 h-3 text-[#6F5B77]" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-[#E9D9EF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#FFF7F1] ${
                        language === l.code ? 'font-bold text-[#4A1D8F] bg-[#F1EAF8]' : 'text-[#2B1C33]'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <span className="text-[#4A1D8F]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Auth Area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white hover:bg-[#F1EAF8] border border-[#E9D9EF] transition-all"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#4A1D8F] to-[#FF8A3D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-[#2B1C33] max-w-[100px] truncate">
                    {user.firstName || user.business || user.email}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#6F5B77]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E9D9EF] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-3 border-b border-[#E9D9EF]">
                      <p className="font-bold text-sm text-[#2B1C33] truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName}` : 'Enterseed User'}
                      </p>
                      <p className="text-xs text-[#6F5B77] truncate">{user.email}</p>
                      {user.business && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-[#4A1D8F] bg-[#F1EAF8] px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{user.business}</span>
                        </span>
                      )}
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={async () => {
                          setProfileOpen(false);
                          await logout();
                          setActivePage('login');
                        }}
                        className="w-full flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('appShell.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="text-xs font-bold text-[#4A1D8F] hover:text-[#2C154F] px-3 py-1.5 rounded-xl transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => setActivePage('register')}
                  className="text-xs font-bold text-white bg-[#4A1D8F] hover:bg-[#2C154F] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                >
                  Create account
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#2B1C33] text-white px-6 py-6 border-b border-white/10 space-y-6 animate-in slide-in-from-top-4 duration-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E9D9EF]/50 block mb-2">
                Workspace
              </span>
              <div className="grid grid-cols-2 gap-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-[#4A1D8F] text-white' : 'bg-white/5 text-[#E9D9EF]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#FFD166]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E9D9EF]/50 block mb-2">
                Tools & Guides
              </span>
              <div className="space-y-1">
                {publicNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs text-[#E9D9EF]/80 hover:bg-white/10 text-left"
                    >
                      <Icon className="w-4 h-4 text-[#FF8A3D]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!user && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setQuickDemoUser({
                      email: 'maria.santos@southcotabato.msme.ph',
                      firstName: 'Maria',
                      lastName: 'Santos',
                      business: 'Santos Weaving & Crafts (Koronadal)',
                      preferredLanguage: language
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-[#FF8A3D] text-white rounded-xl text-xs font-bold"
                >
                  ⚡ Quick Demo Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E9D9EF] px-2 py-2 flex items-center justify-around z-40 shadow-lg"
          aria-label="Mobile navigation"
        >
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#4A1D8F] font-bold' : 'text-[#6F5B77]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#4A1D8F]' : 'text-[#6F5B77]'}`} />
                <span className="truncate max-w-[60px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Floating Boss Narra Assistant Widget */}
      <BossNarraWidget />
    </div>
  );
};
