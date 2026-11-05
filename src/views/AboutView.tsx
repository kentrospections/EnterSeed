import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Info,
  ShieldCheck,
  Send,
  MapPin,
  Mail,
  HeartHandshake,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.email || '',
    topic: 'Platform Inquiry',
    message: '',
    consent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setStatusMessage({ text: 'Consent is required to send your inquiry.', type: 'error' });
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');
      setStatusMessage({
        text: `Inquiry recorded (Ref #${data.reference})! Retained for 180 days in our private staff review queue.`,
        type: 'success'
      });
      setForm({
        name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
        email: user?.email || '',
        topic: 'General Question',
        message: '',
        consent: false
      });
    } catch (err: any) {
      setStatusMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2C154F] via-[#4A1D8F] to-[#FF8A3D] rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-[#FFD166] mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Community-Driven MSME Enablement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            About Enterseed Platform
          </h1>
          <p className="text-sm sm:text-base text-[#E9D9EF] leading-relaxed">
            Enterseed is dedicated to empowering micro, small, and medium enterprises in South Cotabato and neighboring SOCCSKSARGEN communities through grounded AI advisory, local supplier directories, and structured compliance roadmaps.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E9D9EF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E4] text-[#F26430] flex items-center justify-center font-bold mb-4">
            01
          </div>
          <h3 className="font-bold text-base text-[#2B1C33] mb-2">Grounded AI Guidance</h3>
          <p className="text-xs text-[#6F5B77] leading-relaxed">
            Boss Narra operates with strict safety policies to prevent legal, tax, and loan hallucinations. Every response provides official government signposts from DTI, BIR, and DOST.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E9D9EF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F1EAF8] text-[#4A1D8F] flex items-center justify-center font-bold mb-4">
            02
          </div>
          <h3 className="font-bold text-base text-[#2B1C33] mb-2">Reviewed Supplier Network</h3>
          <p className="text-xs text-[#6F5B77] leading-relaxed">
            No supplier is listed until they have opted in and passed a 5-point staff verification covering applicant identity, commercial registration, location, and explicit consent.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E9D9EF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#E1EBD4] text-[#76A13C] flex items-center justify-center font-bold mb-4">
            03
          </div>
          <h3 className="font-bold text-base text-[#2B1C33] mb-2">Data Privacy & Retention</h3>
          <p className="text-xs text-[#6F5B77] leading-relaxed">
            Financial figures are private to your account. Anonymous readiness checks are purged after 30 days, and inquiries are retained up to 180 days with immediate deletion rights.
          </p>
        </div>
      </section>

      {/* Contact & Support Inquiry Form */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-1">
          <Mail className="w-4 h-4 text-[#FF8A3D]" />
          <span>Support Desk</span>
        </div>
        <h2 className="text-xl font-bold text-[#2B1C33] mb-1">
          Contact Enterseed Support
        </h2>
        <p className="text-xs text-[#6F5B77] mb-6">
          Have questions regarding supplier verification, platform features, or local MSME tools? Send a direct message to our support staff.
        </p>

        {statusMessage && (
          <div
            className={`p-3.5 mb-5 rounded-2xl text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-[#E1EBD4] text-[#4A1D8F]'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Topic</label>
            <input
              type="text"
              required
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Supplier listing question, local partnership"
              className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Message</label>
            <textarea
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your question or request in detail…"
              className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-0.5 rounded text-[#4A1D8F]"
            />
            <span className="text-xs text-[#6F5B77] leading-relaxed">
              I consent to Enterseed storing this support inquiry for up to 180 days to handle my request.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !form.consent}
            className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3 rounded-2xl shadow transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#FFD166]" />
            <span>{submitting ? 'Sending Inquiry…' : 'Send Support Inquiry'}</span>
          </button>
        </form>
      </section>
    </div>
  );
};
