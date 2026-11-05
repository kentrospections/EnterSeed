import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SupplierMap, SupplierLocation } from '../components/SupplierMap';
import {
  TrendingUp,
  Search,
  Filter,
  PlusCircle,
  Mail,
  Phone,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Send,
  X,
  Truck,
  Calculator,
  Target,
  Sparkles
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  category: string;
  location: string;
  products: string;
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  verifiedAt: string;
}

export const MarketingView: React.FC = () => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSupplierForMap, setSelectedSupplierForMap] = useState<SupplierLocation | null>(null);

  // Supplier Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    businessName: '',
    contactName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    contactEmail: user?.email || '',
    publicEmail: user?.email || '',
    publicPhone: '',
    publishContact: true,
    category: 'packaging' as const,
    location: 'City of Koronadal',
    products: '',
    website: '',
    consent: true
  });
  const [applyStatus, setApplyStatus] = useState<string | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Introduction / Contact Modal
  const [introSupplier, setIntroSupplier] = useState<Supplier | null>(null);
  const [introForm, setIntroForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.email || '',
    message: '',
    consent: true
  });
  const [introStatus, setIntroStatus] = useState<string | null>(null);
  const [introSubmitting, setIntroSubmitting] = useState(false);

  // Shipping Subsidy Calculator state
  const [shippingSpend, setShippingSpend] = useState<number>(1200);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (err) {
      console.warn('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const categories = [
    { id: 'all', label: 'All Suppliers' },
    { id: 'raw-materials', label: 'Raw Materials' },
    { id: 'packaging', label: 'Packaging' },
    { id: 'services', label: 'Services & Logistics' },
    { id: 'marketing', label: 'Marketing & Media' },
  ];

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.products.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplyStatus(null);
    try {
      const res = await fetch('/api/supplier-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(applyForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');
      setApplyStatus('Application submitted! Enterseed staff reviews identity, business evidence, and location before listings are published.');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyStatus(null);
      }, 3000);
    } catch (err: any) {
      setApplyStatus(`Error: ${err.message}`);
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introSupplier) return;
    setIntroSubmitting(true);
    setIntroStatus(null);
    try {
      const res = await fetch(`/api/suppliers/${introSupplier.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(introForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send introduction request');
      setIntroStatus('Introduction request sent! The Enterseed support desk or supplier will follow up.');
      setTimeout(() => {
        setIntroSupplier(null);
        setIntroStatus(null);
      }, 3000);
    } catch (err: any) {
      setIntroStatus(`Error: ${err.message}`);
    } finally {
      setIntroSubmitting(false);
    }
  };

  // Shipping subsidy calculation
  const subsidyAmount = Math.min(shippingSpend * 0.25, 350);
  const netShipping = shippingSpend - subsidyAmount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4 text-[#FF8A3D]" />
          <span>Marketing & Regional Supplier Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight">
          Marketing Strategy & Reviewed Suppliers
        </h1>
        <p className="text-sm text-[#6F5B77] mt-1 max-w-3xl leading-relaxed">
          Connect with reviewed suppliers across South Cotabato, estimate logistics subsidies, and map your 4Ps marketing strategy with local market insight.
        </p>
      </div>

      {/* 4Ps Strategy Guide for South Cotabato MSMEs */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <Target className="w-4 h-4 text-[#FF8A3D]" />
          <span>Core Strategy Framework</span>
        </div>
        <h2 className="text-xl font-bold text-[#2B1C33] mb-4">
          The 4Ps for South Cotabato & SOCCSKSARGEN
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
            <span className="text-xs font-bold text-[#4A1D8F] uppercase block mb-1">1. Product</span>
            <h3 className="font-bold text-sm text-[#2B1C33] mb-1.5">Value & Differentiation</h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Focus on indigenous ingredients (Tupi coffee, Lake Sebu abaca, Surallah rice) and proper FDA/LTO packaging compliance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
            <span className="text-xs font-bold text-[#4A1D8F] uppercase block mb-1">2. Price</span>
            <h3 className="font-bold text-sm text-[#2B1C33] mb-1.5">Cost-Plus & Margin</h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Factor in rising fuel, packaging, and freight costs across Mindanao highways to protect healthy gross margins.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
            <span className="text-xs font-bold text-[#4A1D8F] uppercase block mb-1">3. Place</span>
            <h3 className="font-bold text-sm text-[#2B1C33] mb-1.5">Channels & Logistics</h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Leverage local trade fairs (T'nalak Festival, Negosyo Centers) alongside direct-to-consumer online dispatch.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF]">
            <span className="text-xs font-bold text-[#4A1D8F] uppercase block mb-1">4. Promotion</span>
            <h3 className="font-bold text-sm text-[#2B1C33] mb-1.5">Community Storytelling</h3>
            <p className="text-xs text-[#6F5B77] leading-relaxed">
              Highlight heritage, artisan craftsmanship, and provincial pride. Utilize social media video reels and DTI showcase programs.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping & Logistics Subsidy Calculator */}
      <section className="bg-gradient-to-r from-[#FFF0E4] to-[#FFF7F1] rounded-3xl p-6 sm:p-8 border border-[#FF8A3D]/30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-[#F26430] font-bold text-xs uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>Logistics Support Estimator</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2B1C33]">
              Monthly Shipping Subsidy Estimator
            </h2>
            <p className="text-xs text-[#6F5B77] mt-1 leading-relaxed">
              Calculate projected delivery savings for local MSME transport routes across Region 12. Covers 25% of courier fees (up to ₱350/mo).
            </p>
          </div>

          <div className="flex-1 max-w-lg bg-white p-5 rounded-2xl border border-[#E9D9EF] shadow-xs">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-[#6F5B77]">Estimated Monthly Shipping Spend:</span>
              <strong className="text-[#2B1C33] text-sm">₱{shippingSpend.toLocaleString('en-PH')}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={shippingSpend}
              onChange={(e) => setShippingSpend(Number(e.target.value))}
              className="w-full accent-[#4A1D8F] cursor-pointer mb-4"
            />

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E9D9EF] text-center">
              <div className="p-2 rounded-xl bg-[#E1EBD4]">
                <span className="text-[10px] text-[#4A1D8F] font-bold uppercase block">Est. Subsidy Benefit</span>
                <strong className="text-sm font-extrabold text-[#76A13C]">₱{Math.round(subsidyAmount)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF7F1] border border-[#E9D9EF]">
                <span className="text-[10px] text-[#6F5B77] font-bold uppercase block">Your Net Freight</span>
                <strong className="text-sm font-extrabold text-[#2B1C33]">₱{Math.round(netShipping)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviewed Supplier Directory & Map */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#76A13C]" />
              <span>Verified Directory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B1C33]">
              Reviewed Local Suppliers Directory ({filteredSuppliers.length})
            </h2>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-[#4A1D8F] hover:bg-[#2C154F] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#FFD166]" />
            <span>Apply for Supplier Listing</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9D9EF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6F5B77] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by supplier, town, or product…"
              className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#2B1C33]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  activeCategory === c.id
                    ? 'bg-[#4A1D8F] text-white shadow-xs'
                    : 'bg-[#FFF7F1] text-[#6F5B77] hover:bg-[#E9D9EF]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white p-4 rounded-3xl border border-[#E9D9EF] shadow-sm">
              <h3 className="font-bold text-sm text-[#2B1C33] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF8A3D]" />
                <span>Regional Municipality Map</span>
              </h3>
              <SupplierMap
                suppliers={suppliers}
                selectedSupplier={selectedSupplierForMap}
                onSelectSupplier={(s) => {
                  const match = suppliers.find((x) => x.id === s.id);
                  if (match) setSelectedSupplierForMap(match);
                }}
              />
              <p className="text-[11px] text-[#6F5B77] mt-3 leading-relaxed">
                Pins approximate verified supplier municipalities (Koronadal, Polomolok, Tupi, Lake Sebu, Surallah). Click a card or pin to inspect details.
              </p>
            </div>
          </div>

          {/* Right Column: Supplier Cards */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-sm text-[#6F5B77] animate-pulse">
                Loading reviewed supplier listings…
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-[#E9D9EF] text-center">
                <p className="text-sm font-bold text-[#2B1C33]">No suppliers match your current filter.</p>
                <p className="text-xs text-[#6F5B77] mt-1">Try resetting your search query or category.</p>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <article
                  key={supplier.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E9D9EF] shadow-xs hover:border-[#4A1D8F] transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26430] bg-[#FFF0E4] px-2 py-0.5 rounded-md">
                          {supplier.category.replace('-', ' ')}
                        </span>
                        <h3 className="font-bold text-lg text-[#2B1C33] mt-1">{supplier.name}</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-[#76A13C] bg-[#E1EBD4] px-2.5 py-1 rounded-full whitespace-nowrap">
                        ✓ Reviewed {new Date(supplier.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A1D8F] mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{supplier.location}</span>
                    </div>

                    <p className="text-xs text-[#6F5B77] leading-relaxed mb-4">
                      {supplier.products}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E9D9EF] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      {supplier.publicEmail && (
                        <a
                          href={`mailto:${supplier.publicEmail}`}
                          className="font-medium text-[#4A1D8F] hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                      {supplier.publicPhone && (
                        <a
                          href={`tel:${supplier.publicPhone}`}
                          className="font-medium text-[#4A1D8F] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{supplier.publicPhone}</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setIntroSupplier(supplier);
                        }}
                        className="font-bold text-[#FF8A3D] hover:underline flex items-center gap-1"
                      >
                        <span>Request Introduction ↗</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSupplierForMap(supplier);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-[#F1EAF8] text-[#4A1D8F] hover:bg-[#4A1D8F] hover:text-white rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Pin on Map</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Supplier Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1C33]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C6F0] max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-5 right-5 text-[#6F5B77] hover:text-[#2B1C33] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#2B1C33] mb-1">
              Apply for Reviewed Supplier Listing
            </h3>
            <p className="text-xs text-[#6F5B77] mb-5 leading-relaxed">
              Enterseed publishes only businesses that opt in and pass human staff review for identity, business registration, contact, and publication consent.
            </p>

            {applyStatus && (
              <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-[#FFF0E4] text-[#F26430] border border-[#FF8A3D]/40">
                {applyStatus}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={applyForm.businessName}
                  onChange={(e) => setApplyForm({ ...applyForm, businessName: e.target.value })}
                  placeholder="e.g. South Cotabato Bio-Pack"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={applyForm.contactName}
                    onChange={(e) => setApplyForm({ ...applyForm, contactName: e.target.value })}
                    placeholder="Full Name"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Private Email (for verification)</label>
                  <input
                    type="email"
                    required
                    value={applyForm.contactEmail}
                    onChange={(e) => setApplyForm({ ...applyForm, contactEmail: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Category</label>
                  <select
                    value={applyForm.category}
                    onChange={(e) => setApplyForm({ ...applyForm, category: e.target.value as any })}
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="raw-materials">Raw Materials</option>
                    <option value="packaging">Packaging</option>
                    <option value="services">Services & Logistics</option>
                    <option value="marketing">Marketing & Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Municipality / Location</label>
                  <input
                    type="text"
                    required
                    value={applyForm.location}
                    onChange={(e) => setApplyForm({ ...applyForm, location: e.target.value })}
                    placeholder="e.g. City of Koronadal"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Products / Capabilities</label>
                <textarea
                  rows={3}
                  required
                  value={applyForm.products}
                  onChange={(e) => setApplyForm({ ...applyForm, products: e.target.value })}
                  placeholder="Describe goods, packaging types, minimum orders, or delivery areas…"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Public Inquiries Email</label>
                  <input
                    type="email"
                    value={applyForm.publicEmail}
                    onChange={(e) => setApplyForm({ ...applyForm, publicEmail: e.target.value })}
                    placeholder="sales@example.ph"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Public Phone</label>
                  <input
                    type="tel"
                    value={applyForm.publicPhone}
                    onChange={(e) => setApplyForm({ ...applyForm, publicPhone: e.target.value })}
                    placeholder="+63 917 000 0000"
                    className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={applyForm.consent}
                  onChange={(e) => setApplyForm({ ...applyForm, consent: e.target.checked })}
                  className="mt-1 rounded text-[#4A1D8F]"
                />
                <span className="text-xs text-[#6F5B77] leading-relaxed">
                  I give permission to Enterseed to verify my business details and publish this listing in the South Cotabato MSME directory upon review.
                </span>
              </label>

              <button
                type="submit"
                disabled={applySubmitting || !applyForm.consent}
                className="w-full bg-[#4A1D8F] hover:bg-[#2C154F] text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs sm:text-sm"
              >
                {applySubmitting ? 'Submitting Application…' : 'Submit for Staff Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Introduction Request Modal */}
      {introSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1C33]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C6F0] relative animate-in fade-in duration-200">
            <button
              onClick={() => setIntroSupplier(null)}
              className="absolute top-5 right-5 text-[#6F5B77] hover:text-[#2B1C33] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#2B1C33] mb-1">
              Request Supplier Introduction
            </h3>
            <p className="text-xs text-[#6F5B77] mb-4">
              Connecting with <strong>{introSupplier.name}</strong> ({introSupplier.location}).
            </p>

            {introStatus && (
              <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-[#E1EBD4] text-[#4A1D8F]">
                {introStatus}
              </div>
            )}

            <form onSubmit={handleIntroSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={introForm.name}
                  onChange={(e) => setIntroForm({ ...introForm, name: e.target.value })}
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={introForm.email}
                  onChange={(e) => setIntroForm({ ...introForm, email: e.target.value })}
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Message or Requirement</label>
                <textarea
                  rows={3}
                  required
                  value={introForm.message}
                  onChange={(e) => setIntroForm({ ...introForm, message: e.target.value })}
                  placeholder="Explain volume needed, specifications, or inquiry details…"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={introForm.consent}
                  onChange={(e) => setIntroForm({ ...introForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#4A1D8F]"
                />
                <span className="text-[11px] text-[#6F5B77]">
                  I consent to sharing my inquiry with this verified supplier and Enterseed support staff.
                </span>
              </label>

              <button
                type="submit"
                disabled={introSubmitting || !introForm.consent}
                className="w-full bg-[#FF8A3D] hover:bg-[#F26430] text-white font-bold py-2.5 rounded-xl shadow transition-all text-xs"
              >
                {introSubmitting ? 'Sending Request…' : 'Send Introduction Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
