import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';
import { ActivePage } from '../components/AppShell';
import {
  Coins,
  TrendingUp,
  FileText,
  Bot,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Building,
  AlertCircle
} from 'lucide-react';

interface FinanceAssessmentData {
  monthlyIncome: number;
  monthlyExpenses: number;
  cashOnHand: number;
  debtOutstanding: number;
  monthlyDebtPayment: number;
  otherAssets: number;
  otherLiabilities: number;
  taxStanding: string;
  updatedAt: string;
}

export const DashboardView: React.FC<{ setActivePage: (page: ActivePage) => void }> = ({ setActivePage }) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [assessment, setAssessment] = useState<FinanceAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await apiFetch('/api/finance/assessment', { headers });
        if (res.ok) {
          const data = await res.json();
          setAssessment(data.assessment || null);
        }
      } catch (err) {
        console.warn('Could not load assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [token]);

  const formatPesos = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const operatingProfit = assessment ? assessment.monthlyIncome - assessment.monthlyExpenses : 0;
  const monthlyOutflows = assessment ? assessment.monthlyExpenses + assessment.monthlyDebtPayment : 0;
  const cashRunway = assessment && monthlyOutflows > 0 ? (assessment.cashOnHand / monthlyOutflows).toFixed(1) : '—';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-[#2C154F] via-[#4A1D8F] to-[#FF8A3D] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 text-[#FFD166]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>South Cotabato & SOCCSKSARGEN MSME Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            {user?.firstName ? `Mabuhay, ${user.firstName}!` : 'Mabuhay & Welcome!'}
          </h1>
          <p className="text-sm sm:text-base text-[#E9D9EF] leading-relaxed">
            {user?.business ? (
              <span>Managing <strong>{user.business}</strong> with grounded tools, regional supplier connections, and official compliance checklists.</span>
            ) : (
              <span>Your all-in-one local business platform for financial assessments, marketing strategy, reviewed suppliers, and grounded AI guidance.</span>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('finance')}
              className="bg-[#FF8A3D] hover:bg-[#F26430] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>{assessment ? 'Review Financial Assessment' : 'Start Financial Checkup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('boss-nana')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-[#FFD166]" />
              <span>Ask Boss Narra AI</span>
            </button>
          </div>
        </div>
      </section>

      {/* Financial Checkup Overview */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-1">
              <Coins className="w-4 h-4 text-[#FF8A3D]" />
              <span>Account Finance Health</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B1C33]">
              Business Financial Snapshot
            </h2>
          </div>
          {assessment && (
            <button
              onClick={() => setActivePage('finance')}
              className="text-xs font-bold text-[#4A1D8F] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Update assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-[#6F5B77] animate-pulse">
            Loading your financial checkup…
          </div>
        ) : assessment ? (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFF7F1] p-4 sm:p-5 rounded-2xl border border-[#E9D9EF]">
                <span className="text-xs text-[#6F5B77] block mb-1">Monthly Income</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-[#2B1C33]">
                  {formatPesos(assessment.monthlyIncome)}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-4 sm:p-5 rounded-2xl border border-[#E9D9EF]">
                <span className="text-xs text-[#6F5B77] block mb-1">Est. Operating Profit</span>
                <strong className={`text-lg sm:text-2xl font-extrabold ${operatingProfit >= 0 ? 'text-[#76A13C]' : 'text-rose-600'}`}>
                  {formatPesos(operatingProfit)}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-4 sm:p-5 rounded-2xl border border-[#E9D9EF]">
                <span className="text-xs text-[#6F5B77] block mb-1">Cash Buffer Runway</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-[#4A1D8F]">
                  {cashRunway} {cashRunway !== '—' && 'months'}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-4 sm:p-5 rounded-2xl border border-[#E9D9EF]">
                <span className="text-xs text-[#6F5B77] block mb-1">Outstanding Debt</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-[#2B1C33]">
                  {formatPesos(assessment.debtOutstanding)}
                </strong>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-[#F1EAF8] rounded-xl flex items-start gap-2.5 text-xs text-[#4A1D8F]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Figures represent user-reported monthly estimates for financial planning. Always verify with actual ledgers and official tax declarations before applying for financing.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF7F1] rounded-2xl p-6 sm:p-8 text-center border border-dashed border-[#D8C6F0]">
            <div className="w-12 h-12 rounded-full bg-[#FFF0E4] text-[#F26430] flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2B1C33] mb-1">No Assessment Saved Yet</h3>
            <p className="text-xs text-[#6F5B77] max-w-md mx-auto mb-5 leading-relaxed">
              Complete your private monthly income, expense, cash, and debt checkup to unlock tailored runway analysis, debt reviews, and balance snapshots.
            </p>
            <button
              onClick={() => setActivePage('finance')}
              className="bg-[#4A1D8F] hover:bg-[#2C154F] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all"
            >
              Start 3-Minute Checkup
            </button>
          </div>
        )}
      </section>

      {/* Quick Action Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setActivePage('marketing')}
          className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-xs hover:shadow-md hover:border-[#4A1D8F] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E4] text-[#FF8A3D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#2B1C33] mb-2 group-hover:text-[#4A1D8F] transition-colors">
              Reviewed Supplier Directory
            </h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Discover verified local suppliers in packaging, raw materials, agriculture, and logistics across South Cotabato and SOCCSKSARGEN.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#FF8A3D] group-hover:text-[#4A1D8F]">
            <span>Explore directory & map</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActivePage('documents')}
          className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-xs hover:shadow-md hover:border-[#4A1D8F] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F1EAF8] text-[#4A1D8F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#2B1C33] mb-2 group-hover:text-[#4A1D8F] transition-colors">
              Document & Feasibility Generator
            </h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Generate structured business plan and feasibility study drafts for lending applications or cooperative partners locally.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#4A1D8F]">
            <span>Build business plan</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActivePage('boss-nana')}
          className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-xs hover:shadow-md hover:border-[#4A1D8F] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E1EBD4] text-[#76A13C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#2B1C33] mb-2 group-hover:text-[#76A13C] transition-colors">
              Grounded Boss Narra AI
            </h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Consult our AI advisor grounded in official DTI, BIR, DOST, and South Cotabato government verification portals.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#76A13C]">
            <span>Open AI consultation</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Official Compliance Roadmap & Verification Portals */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-4 h-4 text-[#76A13C]" />
          <span>Government Compliance Tracker</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2B1C33] mb-2">
          Philippine MSME Readiness Milestones
        </h2>
        <p className="text-xs text-[#6F5B77] mb-6 max-w-2xl">
          Key statutory requirements for businesses operating in South Cotabato. Use the official links to register and verify up-to-date fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D] block mb-1">Step 1</span>
              <h4 className="font-bold text-sm text-[#2B1C33] mb-1">DTI Business Name</h4>
              <p className="text-xs text-[#6F5B77]">Register your sole proprietorship business name certificate nationwide or regionally.</p>
            </div>
            <a
              href="https://bnrs.dti.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#4A1D8F] hover:underline"
            >
              <span>BNRS Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D] block mb-1">Step 2</span>
              <h4 className="font-bold text-sm text-[#2B1C33] mb-1">Barangay Clearance</h4>
              <p className="text-xs text-[#6F5B77]">Secure commercial clearance from your local barangay in Koronadal, Polomolok, or town.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-[#6F5B77]">Local Barangay Hall</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D] block mb-1">Step 3</span>
              <h4 className="font-bold text-sm text-[#2B1C33] mb-1">Mayor's Permit / BPLO</h4>
              <p className="text-xs text-[#6F5B77]">Apply for municipal or city business permit and fire/sanitary inspection clearances.</p>
            </div>
            <a
              href="https://southcotabato.gov.ph/services/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#4A1D8F] hover:underline"
            >
              <span>Provincial Services</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D] block mb-1">Step 4</span>
              <h4 className="font-bold text-sm text-[#2B1C33] mb-1">BIR Registration</h4>
              <p className="text-xs text-[#6F5B77]">Form 1901, TIN, books of accounts, and authority to print (ATP) official receipts.</p>
            </div>
            <a
              href="https://www.bir.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#4A1D8F] hover:underline"
            >
              <span>BIR eServices</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
