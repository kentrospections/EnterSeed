import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { ActivePage } from '../components/AppShell';
import {
  Lock,
  Mail,
  Building,
  User,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Globe,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Coins,
  MapPin,
  FileText
} from 'lucide-react';

interface AuthViewProps {
  initialMode: 'login' | 'register';
  setActivePage: (page: ActivePage) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode, setActivePage }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const { login, register, setQuickDemoUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [business, setBusiness] = useState('');
  const [agree, setAgree] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      if (!agree) {
        setError('Please agree to the terms to create your account.');
        setLoading(false);
        return;
      }
      const res = await register({
        firstName,
        lastName,
        email,
        password,
        business
      });
      if (res.success) {
        setActivePage('dashboard');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email, password, remember);
      if (res.success) {
        setActivePage('dashboard');
      } else {
        setError(res.error || 'Sign in failed. Check your email and password.');
      }
    }
    setLoading(false);
  };

  const handleDemoSignIn = () => {
    setQuickDemoUser({
      email: 'santos.crafts@southcotabato.msme.ph',
      firstName: 'Maria Elena',
      lastName: 'Santos',
      business: 'Santos Weaving & Agricultural Exports (Koronadal)',
      preferredLanguage: language
    });
    setActivePage('dashboard');
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fil', label: 'Filipino (Tagalog)' },
    { code: 'hil', label: 'Hiligaynon' }
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex flex-col justify-between selection:bg-[#FFD166] selection:text-[#4A1D8F]">
      {/* Standalone Navigation Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#E9D9EF] px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4A1D8F] to-[#FF8A3D] p-1.5 flex items-center justify-center shadow-md">
            <img src="./logos/Icon White.png" alt="Enterseed" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#4A1D8F] block leading-tight">Enterseed</span>
            <span className="text-[10px] text-[#FF8A3D] font-bold uppercase tracking-wider block">South Cotabato MSME Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Public navigation quick links */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[#6F5B77]">
            <button onClick={() => setActivePage('about')} className="hover:text-[#4A1D8F] transition-colors">
              About
            </button>
            <button onClick={() => setActivePage('efiling')} className="hover:text-[#4A1D8F] transition-colors">
              E-Filing
            </button>
            <button onClick={() => setActivePage('pricing')} className="hover:text-[#4A1D8F] transition-colors">
              Pricing
            </button>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2B1C33] bg-[#F1EAF8] hover:bg-[#E9D9EF] rounded-xl border border-[#D8C6F0] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#4A1D8F]" />
              <span className="uppercase text-[11px] font-bold">{language}</span>
              <ChevronDown className="w-3 h-3 text-[#6F5B77]" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#E9D9EF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
        </div>
      </header>

      {/* Main Authentication Content (Two-Column on Desktop) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Platform Mission & Value Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FFF0E4] border border-[#FF8A3D]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F26430]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Local MSME Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B1C33] tracking-tight leading-[1.1]">
              Grow smarter with <span className="text-[#4A1D8F]">Enterseed</span> & Boss Narra.
            </h2>

            <p className="text-sm sm:text-base text-[#6F5B77] leading-relaxed max-w-lg">
              Sign in to your private workspace to run cash flow checkups, discover reviewed suppliers across South Cotabato, and consult our grounded AI advisor.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F1EAF8] text-[#4A1D8F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1C33]">Private Financial Checkup</h4>
                  <p className="text-xs text-[#6F5B77] leading-snug">Assess monthly operating margins, debt servicing, and cash runway buffers securely.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0E4] text-[#FF8A3D] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1C33]">Reviewed Supplier Directory & Map</h4>
                  <p className="text-xs text-[#6F5B77] leading-snug">Connect with verified local packaging, raw material, and logistics partners in Region 12.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E1EBD4] text-[#76A13C] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1C33]">Grounded Boss Narra AI Advisor</h4>
                  <p className="text-xs text-[#6F5B77] leading-snug">Reliable MSME consultation with verification links to DTI, BIR, DOST, and provincial offices.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-xl relative overflow-hidden">
              {/* Tab Selector: Sign In vs Create Account */}
              <div className="grid grid-cols-2 p-1 bg-[#FFF7F1] rounded-2xl border border-[#E9D9EF] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    !isRegister
                      ? 'bg-[#4A1D8F] text-white shadow-xs'
                      : 'text-[#6F5B77] hover:text-[#2B1C33]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    isRegister
                      ? 'bg-[#4A1D8F] text-white shadow-xs'
                      : 'text-[#6F5B77] hover:text-[#2B1C33]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isRegister && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1C33] mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Maria"
                          className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Santos"
                          className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Business Name</label>
                      <input
                        type="text"
                        required
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="e.g. Tupi Agro-Coffee Roasters"
                        className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@business.ph"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">
                    Password {isRegister && <span className="text-[#6F5B77] font-normal">(min 12 chars)</span>}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={isRegister ? 12 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                  />
                </div>

                {isRegister ? (
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      required
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 rounded text-[#4A1D8F]"
                    />
                    <span className="text-[11px] text-[#6F5B77] leading-tight">
                      I agree to the terms of service and store my financial figures securely for workspace tools.
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded text-[#4A1D8F]"
                      />
                      <span className="text-[#6F5B77] text-[11px]">Keep me signed in</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 mt-4"
                >
                  <span>{loading ? 'Processing…' : isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 text-[#FFD166]" />
                </button>
              </form>

              {/* Fast Demo Access Button */}
              <div className="mt-5 pt-4 border-t border-[#E9D9EF] text-center">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full py-2.5 bg-[#FFF0E4] hover:bg-[#FFE3CF] text-[#F26430] border border-[#FF8A3D]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>⚡ Instant Demo Access (Preview Workspace)</span>
                </button>
                <p className="text-[10px] text-[#6F5B77] mt-1.5">
                  Pre-configured local MSME profile for test evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-[#E9D9EF] bg-white py-4 px-6 text-center text-xs text-[#6F5B77]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Enterseed Platform · Empowering South Cotabato & SOCCSKSARGEN MSMEs</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setActivePage('about')} className="hover:text-[#4A1D8F]">
              Mission & Support
            </button>
            <button onClick={() => setActivePage('admin')} className="hover:text-[#4A1D8F]">
              Staff Review Desk
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
