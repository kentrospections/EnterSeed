import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Tag,
  Check,
  Truck,
  Sparkles,
  HelpCircle,
  Building2,
  Users
} from 'lucide-react';

export const PricingView: React.FC = () => {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const [shippingSpend, setShippingSpend] = useState<number>(1400);

  const subsidy = Math.min(shippingSpend * 0.25, 350);
  const netShipping = shippingSpend - subsidy;

  const plans = [
    {
      name: 'Community Starter',
      badge: 'Free Forever',
      desc: 'Essential guidance and public directories for new entrepreneurs in South Cotabato.',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        'Public reviewed supplier directory & map',
        'Boss Narra offline local guidance',
        'Anonymous 30-day readiness checklist',
        'Business plan outline draft generator',
        'Official e-filing portal directory'
      ],
      cta: 'Current Plan',
      highlight: false
    },
    {
      name: 'Pro MSME',
      badge: 'Most Popular',
      desc: 'Complete financial checkup tools and grounded AI consultations for growing enterprises.',
      priceMonthly: 490,
      priceYearly: 4900,
      features: [
        'All Community features included',
        'Grounded Boss Narra AI with Gemini intelligence',
        'Saved financial health assessment & runway model',
        'Direct supplier introduction requests',
        'Feasibility study export with lender discussion checklist',
        'Regional logistics subsidy matching'
      ],
      cta: 'Upgrade to Pro',
      highlight: true
    },
    {
      name: 'Cooperative / Cluster',
      badge: 'For Associations',
      desc: 'For agricultural cooperatives, artisan associations, and municipal business groups.',
      priceMonthly: 1490,
      priceYearly: 14900,
      features: [
        'All Pro MSME features included',
        'Up to 10 member accounts under 1 cooperative',
        'Bulk supplier pricing negotiation tools',
        'Priority review queue for supplier applications',
        'Custom local economic data snapshots'
      ],
      cta: 'Contact for Co-op Plan',
      highlight: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2 bg-[#F1EAF8] px-3.5 py-1.5 rounded-full">
          <Tag className="w-4 h-4 text-[#FF8A3D]" />
          <span>Transparent MSME Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2B1C33] tracking-tight">
          Simple Plans for Local Growth
        </h1>
        <p className="text-sm text-[#6F5B77] mt-2 leading-relaxed">
          Start for free or equip your growing enterprise with saved assessments, AI advisory, and direct supplier introductions.
        </p>

        {/* Cadence Toggle */}
        <div className="mt-6 inline-flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-[#E9D9EF] shadow-xs">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !isYearly ? 'bg-[#4A1D8F] text-white shadow-xs' : 'text-[#6F5B77]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isYearly ? 'bg-[#4A1D8F] text-white shadow-xs' : 'text-[#6F5B77]'
            }`}
          >
            <span>Annual (2 Months Free)</span>
            <span className="text-[10px] bg-[#FF8A3D] text-white px-1.5 py-0.5 rounded-md">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
              p.highlight
                ? 'bg-white border-2 border-[#4A1D8F] shadow-xl relative'
                : 'bg-white/80 border border-[#E9D9EF] shadow-xs hover:border-[#D8C6F0]'
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF8A3D] text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm">
                {p.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-[#2B1C33]">{p.name}</h3>
                {!p.highlight && (
                  <span className="text-[10px] font-bold text-[#6F5B77] bg-[#FFF7F1] px-2 py-0.5 rounded-md border border-[#E9D9EF]">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6F5B77] leading-relaxed mb-6">{p.desc}</p>

              <div className="mb-6 pb-6 border-b border-[#E9D9EF]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#2B1C33]">
                    ₱{isYearly ? (p.priceYearly ? Math.round(p.priceYearly / 12) : 0) : p.priceMonthly}
                  </span>
                  <span className="text-xs text-[#6F5B77]">/ month</span>
                </div>
                {isYearly && p.priceYearly > 0 && (
                  <span className="text-[11px] text-[#76A13C] font-semibold mt-1 block">
                    Billed ₱{p.priceYearly.toLocaleString('en-PH')} annually
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#2B1C33]">
                    <div className="w-4 h-4 rounded-full bg-[#E1EBD4] text-[#4A1D8F] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#76A13C]" />
                    </div>
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-xs ${
                p.highlight
                  ? 'bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white shadow-md'
                  : 'bg-[#FFF7F1] hover:bg-[#E9D9EF] text-[#4A1D8F] border border-[#D8C6F0]'
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Shipping Subsidy Calculator Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <Truck className="w-4 h-4 text-[#FF8A3D]" />
          <span>Regional MSME Logistics Incentive</span>
        </div>
        <h2 className="text-xl font-bold text-[#2B1C33] mb-1">
          Calculate Your Delivery Savings
        </h2>
        <p className="text-xs text-[#6F5B77] mb-6">
          MSME members in South Cotabato qualify for estimated freight subsidies across Koronadal, General Santos, and Davao distribution lines.
        </p>

        <div className="space-y-4 bg-[#FFF7F1] p-6 rounded-2xl border border-[#E9D9EF]">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#6F5B77]">Monthly Freight / Courier Spend:</span>
            <strong className="text-base font-extrabold text-[#4A1D8F]">
              ₱{shippingSpend.toLocaleString('en-PH')}
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={shippingSpend}
            onChange={(e) => setShippingSpend(Number(e.target.value))}
            className="w-full accent-[#4A1D8F] cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E9D9EF]">
            <div className="bg-white p-4 rounded-xl border border-[#E9D9EF] text-center">
              <span className="text-xs text-[#6F5B77] block mb-1">Projected Subsidy (25%, max ₱350)</span>
              <strong className="text-xl font-extrabold text-[#76A13C]">
                ₱{Math.round(subsidy)}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E9D9EF] text-center">
              <span className="text-xs text-[#6F5B77] block mb-1">Your Net Shipping Cost</span>
              <strong className="text-xl font-extrabold text-[#2B1C33]">
                ₱{Math.round(netShipping)}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
