import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ActivePage } from '../components/AppShell';
import { Lock, Mail, Building, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthViewProps {
  initialMode: 'login' | 'register';
  setActivePage: (page: ActivePage) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode, setActivePage }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const { login, register, setQuickDemoUser } = useAuth();
  const { language } = useLanguage();

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
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password, remember);
      if (res.success) {
        setActivePage('dashboard');
      } else {
        setError(res.error || 'Sign in failed');
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

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-md relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4A1D8F] to-[#FF8A3D] p-2.5 mx-auto mb-3 shadow-md flex items-center justify-center">
            <img src="/logos/Icon White.png" alt="Enterseed" className="w-7 h-7 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#2B1C33] tracking-tight">
            {isRegister ? 'Create Your MSME Account' : 'Sign In to Enterseed'}
          </h1>
          <p className="text-xs text-[#6F5B77] mt-1">
            {isRegister
              ? 'Join South Cotabato’s MSME workspace with grounded tools and verified suppliers.'
              : 'Access your private financial assessment, strategy, and Boss Narra workspace.'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33]"
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
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33]"
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
                  placeholder="e.g. Tupi High-Land Coffee"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33]"
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
              className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33]"
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
              className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33]"
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
            className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Processing…' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#FFD166]" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 pt-5 border-t border-[#E9D9EF] text-center">
          <p className="text-xs text-[#6F5B77]">
            {isRegister ? 'Already registered on Enterseed?' : 'Don’t have an MSME account yet?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-bold text-[#4A1D8F] hover:underline mt-1"
          >
            {isRegister ? 'Sign in to existing account' : 'Create new business account'}
          </button>
        </div>

        {/* Fast Demo Guest Button */}
        <div className="mt-4 pt-4 border-t border-[#E9D9EF] text-center">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 bg-[#FFF0E4] hover:bg-[#FFE3CF] text-[#F26430] border border-[#FF8A3D]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
            <span>Instant Demo Sign-in (Local MSME Profile)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
