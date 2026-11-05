import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../services/apiClient';
import {
  FileCheck2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';

export const EfilingView: React.FC = () => {
  const { t } = useLanguage();

  const [stage, setStage] = useState<'unregistered' | 'registered'>('unregistered');
  const [needs, setNeeds] = useState<string[]>(['efiling', 'suppliers']);
  const [location, setLocation] = useState('City of Koronadal');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteToken, setDeleteToken] = useState<string | null>(() => sessionStorage.getItem('enterseed_readiness_token'));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleNeed = (id: string) => {
    setNeeds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || needs.length === 0) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await apiFetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ stage, needs, location, consent: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save readiness assessment.');
      setDeleteToken(data.deleteToken);
      sessionStorage.setItem('enterseed_readiness_token', data.deleteToken);
      setStatusMessage('Readiness assessment recorded! Stored for 30 days without collecting personal name or email.');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteToken) return;
    try {
      const res = await apiFetch(`/api/readiness/${deleteToken}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteToken(null);
        sessionStorage.removeItem('enterseed_readiness_token');
        setStatusMessage('Your assessment has been deleted from the database.');
      }
    } catch {
      setStatusMessage('Failed to delete assessment.');
    }
  };

  const portalDirectory = [
    {
      agency: 'Department of Trade and Industry (DTI)',
      title: 'Business Name Registration System (BNRS Next Gen)',
      desc: 'Register and renew sole proprietorship business names online with digital certificate download.',
      url: 'https://bnrs.dti.gov.ph/'
    },
    {
      agency: 'Bureau of Internal Revenue (BIR)',
      title: 'Online Registration and Update System (ORUS) & eServices',
      desc: 'Apply for TIN, register books of accounts, and download electronic BIR forms (eBIRForms).',
      url: 'https://www.bir.gov.ph/'
    },
    {
      agency: 'Social Security System (SSS)',
      title: 'My.SSS Employer Portal',
      desc: 'Submit employee monthly contribution lists (R-3) and manage employer compliance.',
      url: 'https://www.sss.gov.ph/'
    },
    {
      agency: 'PhilHealth',
      title: 'Electronic Premium Remittance System (EPRS)',
      desc: 'Online generation of Statement of Premium Accounts (SPA) and premium payment tracking.',
      url: 'https://www.philhealth.gov.ph/'
    },
    {
      agency: 'Pag-IBIG Fund',
      title: 'Virtual Pag-IBIG for Employers',
      desc: 'Remit mandatory housing fund contributions and verify employee MID numbers.',
      url: 'https://www.pagibigfund.gov.ph/'
    },
    {
      agency: 'South Cotabato LGU',
      title: 'Provincial Government E-Services',
      desc: 'Checklist of provincial business permits, veterinary/agricultural clearances, and tourism accreditations.',
      url: 'https://southcotabato.gov.ph/services/'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <FileCheck2 className="w-4 h-4 text-[#FF8A3D]" />
          <span>Compliance & Registration Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight">
          MSME Readiness & Government E-Filing
        </h1>
        <p className="text-sm text-[#6F5B77] mt-1 max-w-3xl leading-relaxed">
          Take a privacy-safe readiness assessment to map your required filings, and route directly to official Philippine government regulatory portals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Readiness Assessment Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
          <h2 className="text-lg font-bold text-[#2B1C33] mb-2">
            30-Day Anonymous Readiness Checkup
          </h2>
          <p className="text-xs text-[#6F5B77] mb-5 leading-relaxed">
            We collect stage, municipality, and selected business needs only. No name, email, or telephone is recorded.
          </p>

          {statusMessage && (
            <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-[#E1EBD4] text-[#4A1D8F] border border-[#76A13C]/30 flex items-center justify-between">
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-2">Business Stage</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStage('unregistered')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left ${
                    stage === 'unregistered'
                      ? 'bg-[#4A1D8F] text-white border-[#4A1D8F]'
                      : 'bg-[#FFF7F1] text-[#6F5B77] border-[#E9D9EF]'
                  }`}
                >
                  🌱 Planning / Unregistered
                </button>
                <button
                  type="button"
                  onClick={() => setStage('registered')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left ${
                    stage === 'registered'
                      ? 'bg-[#4A1D8F] text-white border-[#4A1D8F]'
                      : 'bg-[#FFF7F1] text-[#6F5B77] border-[#E9D9EF]'
                  }`}
                >
                  🏢 Already Registered
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-2">
                Current Support Needs (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { id: 'efiling', label: 'Government E-Filing & Permits Checklist' },
                  { id: 'feasibility', label: 'Feasibility Study & Loan Outline' },
                  { id: 'suppliers', label: 'Local Supplier & Packaging Directory' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF7F1] border border-[#E9D9EF] text-xs font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={needs.includes(item.id)}
                      onChange={() => toggleNeed(item.id)}
                      className="rounded text-[#4A1D8F]"
                    />
                    <span className="text-[#2B1C33]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Municipality</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. City of Koronadal"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#4A1D8F]"
              />
              <span className="text-xs text-[#6F5B77] leading-relaxed">
                I agree to store this anonymous assessment for up to 30 days to receive localized guidance.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !consent || needs.length === 0}
              className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3 rounded-2xl shadow transition-all text-xs"
            >
              {submitting ? 'Recording…' : 'Record Anonymous Assessment'}
            </button>
          </form>

          {deleteToken && (
            <div className="mt-5 pt-4 border-t border-[#E9D9EF] flex items-center justify-between text-xs">
              <span className="text-[#6F5B77]">Token held in session</span>
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete my assessment now</span>
              </button>
            </div>
          )}
        </div>

        {/* Official E-Filing Portals Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
            <h2 className="text-lg font-bold text-[#2B1C33] mb-1">
              Direct Government E-Filing Portals
            </h2>
            <p className="text-xs text-[#6F5B77] mb-6">
              Official online services for sole proprietors, partnerships, and cooperatives in Region 12.
            </p>

            <div className="space-y-3.5">
              {portalDirectory.map((portal, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] hover:border-[#4A1D8F] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D] block mb-0.5">
                      {portal.agency}
                    </span>
                    <h3 className="font-bold text-sm text-[#2B1C33] mb-1">{portal.title}</h3>
                    <p className="text-xs text-[#6F5B77] leading-relaxed">{portal.desc}</p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#4A1D8F] hover:bg-[#4A1D8F] hover:text-white border border-[#D8C6F0] rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-center whitespace-nowrap"
                  >
                    <span>Open Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
