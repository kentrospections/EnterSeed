import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Save,
  HelpCircle,
  FileCheck,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Building
} from 'lucide-react';

interface AssessmentForm {
  monthlyIncome: string;
  monthlyExpenses: string;
  cashOnHand: string;
  debtOutstanding: string;
  monthlyDebtPayment: string;
  otherAssets: string;
  otherLiabilities: string;
  taxStanding: 'current' | 'needs-filing' | 'behind' | 'not-registered';
  consent: boolean;
}

export const FinanceView: React.FC = () => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [form, setForm] = useState<AssessmentForm>({
    monthlyIncome: '',
    monthlyExpenses: '',
    cashOnHand: '',
    debtOutstanding: '',
    monthlyDebtPayment: '',
    otherAssets: '',
    otherLiabilities: '',
    taxStanding: 'current',
    consent: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hasSavedAssessment, setHasSavedAssessment] = useState(false);

  // Fetch saved assessment
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/finance/assessment', {
          headers,
          credentials: 'same-origin'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setForm({
              monthlyIncome: String(data.assessment.monthlyIncome),
              monthlyExpenses: String(data.assessment.monthlyExpenses),
              cashOnHand: String(data.assessment.cashOnHand),
              debtOutstanding: String(data.assessment.debtOutstanding),
              monthlyDebtPayment: String(data.assessment.monthlyDebtPayment),
              otherAssets: String(data.assessment.otherAssets),
              otherLiabilities: String(data.assessment.otherLiabilities),
              taxStanding: data.assessment.taxStanding || 'current',
              consent: true
            });
            setHasSavedAssessment(true);
          }
        }
      } catch (err) {
        console.warn('Error fetching finance assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!form.consent) {
      setStatusMessage({ text: t('finance.consentRequired'), type: 'error' });
      return;
    }

    // Validate integer numbers
    const numFields = [
      'monthlyIncome',
      'monthlyExpenses',
      'cashOnHand',
      'debtOutstanding',
      'monthlyDebtPayment',
      'otherAssets',
      'otherLiabilities'
    ] as const;

    const payload: Record<string, any> = {
      taxStanding: form.taxStanding,
      consent: true
    };

    for (const f of numFields) {
      const raw = form[f].trim();
      if (!raw) {
        setStatusMessage({ text: t('finance.amountRequired'), type: 'error' });
        return;
      }
      const val = Number(raw);
      if (!Number.isSafeInteger(val) || val < 0 || val > 1_000_000_000) {
        setStatusMessage({ text: t('finance.amountInvalid'), type: 'error' });
        return;
      }
      payload[f] = val;
    }

    setSaving(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/finance/assessment', {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('finance.error'));
      }

      setHasSavedAssessment(true);
      setStatusMessage({ text: t('finance.saved'), type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || t('finance.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your saved assessment?')) return;
    setStatusMessage(null);
    setSaving(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/finance/assessment', {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
      });

      if (res.ok) {
        setForm({
          monthlyIncome: '',
          monthlyExpenses: '',
          cashOnHand: '',
          debtOutstanding: '',
          monthlyDebtPayment: '',
          otherAssets: '',
          otherLiabilities: '',
          taxStanding: 'current',
          consent: false
        });
        setHasSavedAssessment(false);
        setStatusMessage({ text: t('finance.deleted'), type: 'success' });
      }
    } catch {
      setStatusMessage({ text: t('finance.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const formatPesos = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Live calculation estimates
  const income = Number(form.monthlyIncome) || 0;
  const expenses = Number(form.monthlyExpenses) || 0;
  const cash = Number(form.cashOnHand) || 0;
  const debt = Number(form.debtOutstanding) || 0;
  const debtPayment = Number(form.monthlyDebtPayment) || 0;
  const otherAssets = Number(form.otherAssets) || 0;
  const otherLiab = Number(form.otherLiabilities) || 0;

  const operatingProfit = income - expenses;
  const monthlyOutflows = expenses + debtPayment;
  const cashMonths = monthlyOutflows > 0 ? cash / monthlyOutflows : null;
  const totalAssets = cash + otherAssets;
  const totalLiabilities = debt + otherLiab;
  const estimatedEquity = totalAssets - totalLiabilities;
  const cashAfterDebt = operatingProfit - debtPayment;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <Coins className="w-4 h-4 text-[#FF8A3D]" />
          <span>Finance Checkup & Practice Sets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight">
          {t('finance.title')}
        </h1>
        <p className="text-sm text-[#6F5B77] mt-1 max-w-3xl leading-relaxed">
          {t('finance.intro')}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-[#E1EBD4] text-[#4A1D8F] border border-[#76A13C]/40'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#76A13C]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid: Form on Left, Live Practice Set Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Assessment Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
          <h2 className="text-lg font-bold text-[#2B1C33] mb-5 pb-3 border-b border-[#E9D9EF] flex items-center justify-between">
            <span>Enter Monthly Totals & Balances</span>
            <span className="text-xs font-normal text-[#6F5B77]">Philippine Pesos (PHP)</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.income')} (₱)
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={form.monthlyIncome}
                  onChange={handleChange}
                  placeholder="e.g. 85000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.expenses')} (₱)
                </label>
                <input
                  type="number"
                  name="monthlyExpenses"
                  value={form.monthlyExpenses}
                  onChange={handleChange}
                  placeholder="e.g. 52000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.cash')} (₱)
                </label>
                <input
                  type="number"
                  name="cashOnHand"
                  value={form.cashOnHand}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.debt')} (₱)
                </label>
                <input
                  type="number"
                  name="debtOutstanding"
                  value={form.debtOutstanding}
                  onChange={handleChange}
                  placeholder="e.g. 40000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.debtPayment')} (₱)
                </label>
                <input
                  type="number"
                  name="monthlyDebtPayment"
                  value={form.monthlyDebtPayment}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.otherAssets')} (₱)
                </label>
                <input
                  type="number"
                  name="otherAssets"
                  value={form.otherAssets}
                  onChange={handleChange}
                  placeholder="e.g. 200000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                  {t('finance.otherLiabilities')} (₱)
                </label>
                <input
                  type="number"
                  name="otherLiabilities"
                  value={form.otherLiabilities}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                  min="0"
                  max="1000000000"
                  required
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">
                {t('finance.taxStanding')}
              </label>
              <select
                name="taxStanding"
                value={form.taxStanding}
                onChange={handleChange}
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2B1C33]"
              >
                <option value="current">{t('finance.current')}</option>
                <option value="needs-filing">{t('finance.needsFiling')}</option>
                <option value="behind">{t('finance.behind')}</option>
                <option value="not-registered">{t('finance.notRegistered')}</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-[#D8C6F0] text-[#4A1D8F] focus:ring-[#4A1D8F]"
                />
                <span className="text-xs text-[#6F5B77] leading-relaxed">
                  {t('finance.consent')}
                </span>
              </label>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm"
              >
                <Save className="w-4 h-4 text-[#FFD166]" />
                <span>{saving ? 'Saving…' : t('finance.save')}</span>
              </button>

              {hasSavedAssessment && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('finance.delete')}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Calculation & Practice Set Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-sm">
            <h3 className="font-bold text-base text-[#2B1C33] mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#4A1D8F]" />
              <span>{t('finance.reportTitle')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#FFF7F1] p-3 rounded-xl border border-[#E9D9EF]">
                <span className="text-[11px] text-[#6F5B77] block">{t('finance.operatingProfit')}</span>
                <strong className={`text-base font-extrabold ${operatingProfit >= 0 ? 'text-[#76A13C]' : 'text-rose-600'}`}>
                  {formatPesos(operatingProfit)}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-3 rounded-xl border border-[#E9D9EF]">
                <span className="text-[11px] text-[#6F5B77] block">{t('finance.cashBuffer')}</span>
                <strong className="text-base font-extrabold text-[#4A1D8F]">
                  {cashMonths === null ? '—' : `${cashMonths.toFixed(1)} mo.`}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-3 rounded-xl border border-[#E9D9EF]">
                <span className="text-[11px] text-[#6F5B77] block">{t('finance.totalAssets')}</span>
                <strong className="text-base font-extrabold text-[#2B1C33]">
                  {formatPesos(totalAssets)}
                </strong>
              </div>

              <div className="bg-[#FFF7F1] p-3 rounded-xl border border-[#E9D9EF]">
                <span className="text-[11px] text-[#6F5B77] block">{t('finance.estimatedEquity')}</span>
                <strong className="text-base font-extrabold text-[#2B1C33]">
                  {formatPesos(estimatedEquity)}
                </strong>
              </div>
            </div>

            {/* Practice Sets / Financial Reports Summary */}
            <div className="space-y-3 border-t border-[#E9D9EF] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A1D8F]">
                {t('finance.reports')}
              </h4>

              <div className="text-xs space-y-2 bg-[#FCFAFE] p-3.5 rounded-xl border border-[#E4D7EF]">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#E9D9EF]">
                  <span className="text-[#6F5B77]">{t('finance.reportProfitLoss')}</span>
                  <span className="font-bold text-[#2B1C33]">{formatPesos(operatingProfit)}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-[#E9D9EF]">
                  <span className="text-[#6F5B77]">{t('finance.cashFlowAfterDebt')}</span>
                  <span className="font-bold text-[#2B1C33]">{formatPesos(cashAfterDebt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6F5B77]">{t('finance.reportBalanceSheet')}</span>
                  <span className="font-bold text-[#2B1C33]">Eq: {formatPesos(estimatedEquity)}</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-[#6F5B77] leading-relaxed">
              {t('finance.estimateDisclaimer')}
            </p>
          </div>

          {/* Contextual Recommendations Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#2B1C33] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#FF8A3D]" />
              <span>Personalized Recommendations</span>
            </h3>

            {/* Cash Management Recommendation */}
            <div className="p-3.5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
              <span className="text-[11px] font-bold text-[#4A1D8F] block mb-1">
                {t('finance.cashManagement')}
              </span>
              <p className="text-xs text-[#2B1C33] leading-relaxed">
                {operatingProfit <= 0
                  ? t('finance.negativeCash')
                  : cashMonths !== null && cashMonths < 1
                  ? t('finance.lowBuffer')
                  : cashMonths !== null
                  ? t('finance.reserve', { months: cashMonths.toFixed(1) })
                  : t('finance.positiveCash')}
              </p>
            </div>

            {/* Debt Management Recommendation */}
            <div className="p-3.5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
              <span className="text-[11px] font-bold text-[#4A1D8F] block mb-1">
                {t('finance.debtManagement')}
              </span>
              <p className="text-xs text-[#2B1C33] leading-relaxed">
                {debt === 0
                  ? t('finance.noDebt')
                  : operatingProfit > 0 && debtPayment > operatingProfit * 0.5
                  ? t('finance.highDebt')
                  : t('finance.debtReview')}
              </p>
            </div>

            {/* Tax Compliance Guidance */}
            <div className="p-3.5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
              <span className="text-[11px] font-bold text-[#4A1D8F] block mb-1">
                {t('finance.taxCompliance')}
              </span>
              <p className="text-xs text-[#2B1C33] leading-relaxed">
                {form.taxStanding === 'current'
                  ? t('finance.taxCurrent')
                  : form.taxStanding === 'needs-filing'
                  ? t('finance.taxDue')
                  : form.taxStanding === 'behind'
                  ? t('finance.taxBehind')
                  : t('finance.taxNotRegistered')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
