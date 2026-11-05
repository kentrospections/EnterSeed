import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Building,
  ExternalLink
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [docType, setDocType] = useState<'business-plan' | 'feasibility'>('business-plan');
  const [businessName, setBusinessName] = useState(user?.business || 'South Cotabato Artisan Delights');
  const [description, setDescription] = useState('Production and retail packaging of high-altitude Arabica coffee and artisanal cacao treats.');
  const [location, setLocation] = useState('Tupi, South Cotabato');
  const [capital, setCapital] = useState('150000');
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCapital = Number(capital || 0).toLocaleString('en-PH');
    const title = docType === 'business-plan' ? 'Business Plan Outline' : 'Feasibility Study Draft';
    const dateStr = new Date().toLocaleDateString('en-PH', { dateStyle: 'long' });

    const htmlContent = `
      <div style="font-family: 'DM Sans', sans-serif; color: #2B1C33; max-width: 800px; margin: 0 auto; padding: 24px;">
        <div style="border-bottom: 2px solid #4A1D8F; padding-bottom: 16px; margin-bottom: 24px;">
          <span style="color: #FF8A3D; font-weight: bold; font-size: 12px; text-transform: uppercase;">Enterseed Business Tools · South Cotabato</span>
          <h1 style="color: #4A1D8F; margin: 8px 0 4px; font-size: 28px;">${title}: ${businessName}</h1>
          <p style="margin: 0; font-size: 14px; color: #6F5B77;"><strong>Location:</strong> ${location} · <strong>Prepared:</strong> ${dateStr}</p>
        </div>

        <div style="background: #FFF0E4; border-left: 4px solid #FF8A3D; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #2B1C33; border-radius: 4px;">
          <strong>Working draft only:</strong> Confirm current lender requirements with Land Bank or financial partners. Replace every assumption with verified local records.
        </div>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">1. Executive Summary</h2>
          <p style="font-size: 14px; line-height: 1.6;">${businessName} is an MSME venture based in ${location}. Focuses on: ${description}. Seeking initial funding/capital planning of approximately PHP ${formattedCapital}.</p>
        </section>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">2. Business & Product Concept</h2>
          <p style="font-size: 14px; line-height: 1.6;">Core offering: ${description}. Distinct value proposition relies on local sourcing from South Cotabato growers, premium packaging standards, and direct commercial relationships.</p>
        </section>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">3. Target Market & Competitive Landscape</h2>
          <p style="font-size: 14px; line-height: 1.6;">Target market encompasses local households, regional tourists passing through Koronadal/General Santos highway, and institutional buyers in SOCCSKSARGEN. Competitors are identified in commercial centers; competitive edge rests on authenticity and freshness.</p>
        </section>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">4. Location & Operations</h2>
          <p style="font-size: 14px; line-height: 1.6;">Proposed operational hub in ${location}. Sourcing relies on verified regional packaging and agricultural suppliers. Production adheres to municipal sanitation and DTI guidelines.</p>
        </section>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">5. Startup Costs & Capitalization</h2>
          <p style="font-size: 14px; line-height: 1.6;">Initial capital baseline estimate: <strong>PHP ${formattedCapital}</strong>. Allocation across equipment procurement, raw materials inventory, regulatory permits, and a 3-month operating reserve.</p>
        </section>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">6. Financial Assumptions & Break-Even</h2>
          <p style="font-size: 14px; line-height: 1.6;">Pricing structured at cost-plus margin. Target break-even projected within 6 to 9 months of steady commercial operations. Monthly debt repayment capped comfortably below projected operating surplus.</p>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="color: #4A1D8F; font-size: 18px; border-bottom: 1px solid #E9D9EF; padding-bottom: 6px;">7. Risks & Mitigation</h2>
          <p style="font-size: 14px; line-height: 1.6;">Risks include weather volatility in farm yield and shipping delays across Mindanao transit points. Mitigated through multi-supplier relationships and conservative inventory buffer.</p>
        </section>

        <div style="background: #F1EAF8; border: 1px solid #D8C6F0; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <h3 style="color: #4A1D8F; margin-top: 0; font-size: 16px;">Lender Discussion Checklist</h3>
          <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
            <li>Confirm current loan eligibility and required documentary checklists directly with your lending officer.</li>
            <li>Attach formal quotations from reviewed suppliers for all planned equipment and packaging.</li>
            <li>Present bank statements or ledger records proving historical sales consistency.</li>
          </ul>
        </div>
      </div>
    `;

    setGeneratedDoc(htmlContent);
  };

  const handleDownload = () => {
    if (!generatedDoc) return;
    const blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>${businessName} - Document Outline</title></head><body>${generatedDoc}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-outline.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!generatedDoc) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print Document</title></head><body>${generatedDoc}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4 text-[#FF8A3D]" />
          <span>Filing & Practice Sets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight">
          Document Generator & Compliance Packs
        </h1>
        <p className="text-sm text-[#6F5B77] mt-1 max-w-3xl leading-relaxed">
          Draft structured business plans and feasibility studies locally on your device, and review official government documentary requirements for South Cotabato enterprises.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Generator Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
          <h2 className="text-lg font-bold text-[#2B1C33] mb-4 pb-3 border-b border-[#E9D9EF]">
            Document Outline Generator
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Document Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDocType('business-plan')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    docType === 'business-plan'
                      ? 'bg-[#4A1D8F] text-white border-[#4A1D8F]'
                      : 'bg-[#FFF7F1] text-[#6F5B77] border-[#E9D9EF]'
                  }`}
                >
                  Business Plan
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('feasibility')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    docType === 'feasibility'
                      ? 'bg-[#4A1D8F] text-white border-[#4A1D8F]'
                      : 'bg-[#FFF7F1] text-[#6F5B77] border-[#E9D9EF]'
                  }`}
                >
                  Feasibility Study
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Matutum Harvest Roastery"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Description of Products or Services</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goods, target customers, and business concept…"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Municipality / Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Polomolok, South Cotabato"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1C33] mb-1.5">Estimated Capital (₱)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
              <span>Generate Document Outline</span>
            </button>
          </form>

          <p className="text-[11px] text-[#6F5B77] mt-4 leading-relaxed">
            🔒 Client-side generation only: outline inputs remain private on your computer and are not sent to any external server.
          </p>
        </div>

        {/* Output & Preview Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E9D9EF]">
                <h3 className="font-bold text-base text-[#2B1C33]">
                  Document Preview
                </h3>
                {generatedDoc && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 bg-[#FFF0E4] text-[#F26430] hover:bg-[#FFE3CF] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download HTML</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 bg-[#F1EAF8] text-[#4A1D8F] hover:bg-[#E9D9EF] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {generatedDoc ? (
                <div
                  className="prose prose-sm max-w-none text-[#2B1C33] overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: generatedDoc }}
                />
              ) : (
                <div className="py-20 text-center text-[#6F5B77]">
                  <FileText className="w-12 h-12 text-[#D8C6F0] mx-auto mb-3" />
                  <p className="font-bold text-sm text-[#2B1C33]">Ready to Generate</p>
                  <p className="text-xs text-[#6F5B77] max-w-sm mx-auto mt-1">
                    Fill in your business details on the left and click "Generate Document Outline" to construct your draft plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Government Checklists Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm">
        <h2 className="text-xl font-bold text-[#2B1C33] mb-2">
          Government Documentary & Readiness Checklists
        </h2>
        <p className="text-xs text-[#6F5B77] mb-6 max-w-2xl">
          Standard documents required when applying for registration or funding in Region 12.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] space-y-3">
            <h3 className="font-bold text-sm text-[#4A1D8F] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76A13C]" />
              <span>DTI Business Name (BNRS)</span>
            </h3>
            <ul className="text-xs text-[#6F5B77] space-y-2 list-disc list-inside">
              <li>1 Valid Government-Issued ID (PhilID, Driver's License, Passport)</li>
              <li>Proposed Sole Proprietorship Business Name</li>
              <li>Scope of Registration (Barangay, City, Regional, or National)</li>
              <li>Official registration fee (₱200 - ₱2,000 depending on territorial scope)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] space-y-3">
            <h3 className="font-bold text-sm text-[#4A1D8F] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76A13C]" />
              <span>BIR Tax Registration (Form 1901)</span>
            </h3>
            <ul className="text-xs text-[#6F5B77] space-y-2 list-disc list-inside">
              <li>DTI Certificate of Registration</li>
              <li>Mayor's Business Permit / BPLO assessment</li>
              <li>Proof of Place of Business (Lease contract or Land Title)</li>
              <li>Books of Accounts for stamping and registration</li>
              <li>Authority to Print (ATP) official sales invoices</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] space-y-3">
            <h3 className="font-bold text-sm text-[#4A1D8F] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76A13C]" />
              <span>LGU Mayor's Permit</span>
            </h3>
            <ul className="text-xs text-[#6F5B77] space-y-2 list-disc list-inside">
              <li>Barangay Business Clearance</li>
              <li>Zoning & Building Inspection Clearances</li>
              <li>Sanitary Permit & Health Certificates for staff</li>
              <li>Fire Safety Inspection Certificate (FSIC) from BFP</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
