import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';
import {
  ShieldCheck,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Mail,
  Building,
  MapPin,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  FileCheck2
} from 'lucide-react';

interface SupplierApplication {
  id: number;
  businessName: string;
  contactName: string;
  contactEmail: string;
  publicEmail: string;
  publicPhone: string;
  publishContact: number;
  category: string;
  location: string;
  products: string;
  website: string;
  consentAt: string;
  createdAt: string;
}

interface AdminSupplier {
  id: number;
  businessName: string;
  category: string;
  location: string;
  verifiedAt: string;
  expiresAt: string;
  status: 'active' | 'withdrawn';
}

interface AdminInquiry {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
}

export const AdminView: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('enterseed_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'suppliers' | 'inquiries'>('applications');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);

  // Approval Modal State
  const [approvingApp, setApprovingApp] = useState<SupplierApplication | null>(null);
  const [approvalChecks, setApprovalChecks] = useState({
    identityConfirmed: false,
    businessEvidenceReviewed: false,
    contactConfirmed: false,
    locationConfirmed: false,
    listingConsentConfirmed: false,
    reviewNotes: 'Identity, commercial documents, and publication consent reviewed and confirmed valid.'
  });

  // Reject Modal State
  const [rejectingApp, setRejectingApp] = useState<SupplierApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient commercial proof of business registration in Region 12.');

  const fetchData = async (keyToUse = apiKey) => {
    if (!keyToUse) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const headers = {
        Authorization: `Bearer ${keyToUse}`,
        Accept: 'application/json'
      };

      const [appsRes, supsRes, inqsRes] = await Promise.all([
        apiFetch('/api/admin/supplier-applications', { headers }),
        apiFetch('/api/admin/suppliers', { headers }),
        apiFetch('/api/admin/inquiries', { headers })
      ]);

      if (appsRes.status === 401 || supsRes.status === 401 || inqsRes.status === 401) {
        throw new Error('Invalid Admin API Key. Please verify your secret key.');
      }
      if (appsRes.status === 503 || supsRes.status === 503) {
        // ADMIN_API_KEY might not be configured on server yet, but we allow demo inspection
        throw new Error('Admin review key is not configured in .env on server. Check ADMIN_API_KEY.');
      }

      const appsData = await appsRes.json();
      const supsData = await supsRes.json();
      const inqsData = await inqsRes.json();

      setApplications(appsData.applications || []);
      setSuppliers(supsData.suppliers || []);
      setInquiries(inqsData.inquiries || []);
      setIsAuthenticated(true);
      localStorage.setItem('enterseed_admin_key', keyToUse);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchData(apiKey);
    }
  }, []);

  const handleApprove = async () => {
    if (!approvingApp) return;
    if (
      !approvalChecks.identityConfirmed ||
      !approvalChecks.businessEvidenceReviewed ||
      !approvalChecks.contactConfirmed ||
      !approvalChecks.locationConfirmed ||
      !approvalChecks.listingConsentConfirmed ||
      approvalChecks.reviewNotes.trim().length < 20
    ) {
      alert('All 5 checkboxes and a review note of at least 20 characters are required for approval.');
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/supplier-applications/${approvingApp.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({
          identityConfirmed: true,
          businessEvidenceReviewed: true,
          contactConfirmed: true,
          locationConfirmed: true,
          listingConsentConfirmed: true,
          reviewNotes: approvalChecks.reviewNotes.trim()
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Approval failed');
      }

      setApprovingApp(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectingApp) return;
    if (rejectReason.trim().length < 10) {
      alert('A rejection reason of at least 10 characters is required.');
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/supplier-applications/${rejectingApp.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Rejection failed');
      }

      setRejectingApp(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleWithdrawSupplier = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this supplier from the public directory?')) return;
    try {
      const res = await apiFetch(`/api/admin/suppliers/${id}/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (res.ok) fetchData();
    } catch {
      alert('Failed to withdraw supplier.');
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('Permanently erase this supplier record?')) return;
    try {
      const res = await apiFetch(`/api/admin/suppliers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (res.ok) fetchData();
    } catch {
      alert('Failed to delete supplier.');
    }
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm('Delete this inquiry from staff records?')) return;
    try {
      const res = await apiFetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (res.ok) fetchData();
    } catch {
      alert('Failed to delete inquiry.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />
          <span>Restricted Staff Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight">
          Staff Review Console
        </h1>
        <p className="text-sm text-[#6F5B77] mt-1 max-w-3xl leading-relaxed">
          Internal administrative desk to review pending supplier applications, manage verified directory listings, and respond to incoming inquiries.
        </p>
      </div>

      {/* Authentication Card */}
      {!isAuthenticated ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D9EF] shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0E4] text-[#F26430] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-center font-bold text-lg text-[#2B1C33] mb-1">
            Admin Authentication Required
          </h2>
          <p className="text-center text-xs text-[#6F5B77] mb-6">
            Enter your secret <code className="font-mono text-[#4A1D8F]">ADMIN_API_KEY</code> to open the review queue.
          </p>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchData();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1">Admin API Key</label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter ADMIN_API_KEY secret…"
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1C33] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full bg-[#4A1D8F] hover:bg-[#2C154F] text-white font-bold py-2.5 rounded-xl shadow transition-all text-xs"
            >
              {loading ? 'Authenticating…' : 'Access Staff Console'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar with Status and Refresh */}
          <div className="bg-white p-4 rounded-2xl border border-[#E9D9EF] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76A13C]" />
              <span className="text-xs font-bold text-[#2B1C33]">Authenticated as Staff Reviewer</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData()}
                className="p-2 bg-[#FFF7F1] hover:bg-[#E9D9EF] text-[#4A1D8F] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('enterseed_admin_key');
                  setApiKey('');
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Sign Out Admin
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E9D9EF] gap-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'applications'
                  ? 'text-[#4A1D8F]'
                  : 'text-[#6F5B77] hover:text-[#2B1C33]'
              }`}
            >
              <span>Pending Applications ({applications.length})</span>
              {activeTab === 'applications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A1D8F]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'suppliers'
                  ? 'text-[#4A1D8F]'
                  : 'text-[#6F5B77] hover:text-[#2B1C33]'
              }`}
            >
              <span>All Suppliers ({suppliers.length})</span>
              {activeTab === 'suppliers' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A1D8F]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'inquiries'
                  ? 'text-[#4A1D8F]'
                  : 'text-[#6F5B77] hover:text-[#2B1C33]'
              }`}
            >
              <span>Inquiries Queue ({inquiries.length})</span>
              {activeTab === 'inquiries' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A1D8F]" />
              )}
            </button>
          </div>

          {/* Tab 1: Pending Supplier Applications */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-sm">
              <h3 className="font-bold text-base text-[#2B1C33] mb-4">
                Pending Supplier Applications ({applications.length})
              </h3>

              {applications.length === 0 ? (
                <p className="text-xs text-[#6F5B77] py-8 text-center">
                  No pending supplier applications in queue.
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-[#2B1C33]">{app.businessName}</span>
                          <span className="text-[10px] uppercase font-bold text-[#F26430] bg-[#FFF0E4] px-2 py-0.5 rounded-md">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A1D8F] font-semibold">⌖ {app.location}</p>
                        <p className="text-xs text-[#6F5B77]">
                          Applicant: {app.contactName} ({app.contactEmail})
                        </p>
                        <p className="text-xs text-[#2B1C33] font-medium pt-1">
                          Products: {app.products}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                          onClick={() => setApprovingApp(app)}
                          className="px-4 py-2 bg-[#76A13C] hover:bg-[#5E8230] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Review & Approve
                        </button>
                        <button
                          onClick={() => setRejectingApp(app)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: All Suppliers */}
          {activeTab === 'suppliers' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-sm">
              <h3 className="font-bold text-base text-[#2B1C33] mb-4">
                Directory Suppliers ({suppliers.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E9D9EF] text-[#6F5B77]">
                      <th className="pb-3 font-semibold">Business</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Location</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Verified</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9D9EF]">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FFF7F1]/50">
                        <td className="py-3 font-bold text-[#2B1C33]">{s.businessName}</td>
                        <td className="py-3 text-[#6F5B77]">{s.category}</td>
                        <td className="py-3 text-[#4A1D8F]">{s.location}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'active'
                                ? 'bg-[#E1EBD4] text-[#76A13C]'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#6F5B77]">
                          {new Date(s.verifiedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          {s.status === 'active' && (
                            <button
                              onClick={() => handleWithdrawSupplier(s.id)}
                              className="text-amber-600 hover:underline font-semibold"
                            >
                              Withdraw
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSupplier(s.id)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Inquiries Queue */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E9D9EF] shadow-sm">
              <h3 className="font-bold text-base text-[#2B1C33] mb-4">
                Support & Supplier Inquiries ({inquiries.length})
              </h3>

              {inquiries.length === 0 ? (
                <p className="text-xs text-[#6F5B77] py-8 text-center">No inquiries recorded.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#E9D9EF] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#4A1D8F]">{inq.topic}</span>
                        <span className="text-[10px] text-[#6F5B77]">
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#2B1C33] font-semibold">
                        From: {inq.name} ({inq.email})
                      </p>
                      <p className="text-xs text-[#6F5B77] bg-white p-3 rounded-xl border border-[#E9D9EF]">
                        {inq.message}
                      </p>
                      <div className="flex items-center justify-end gap-3 pt-1 text-xs">
                        <a
                          href={`mailto:${inq.email}?subject=Re: [Enterseed] ${encodeURIComponent(inq.topic)}`}
                          className="font-bold text-[#4A1D8F] hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="font-semibold text-rose-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal with the 5 Required Checks */}
      {approvingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1C33]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C6F0] space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-[#2B1C33]">
              Review & Approve: {approvingApp.businessName}
            </h3>
            <p className="text-xs text-[#6F5B77]">
              Enterseed approval requires validating all five compliance controls before publishing.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                { key: 'identityConfirmed', label: '1. Applicant identity confirmed' },
                { key: 'businessEvidenceReviewed', label: '2. Business registration / commercial evidence reviewed' },
                { key: 'contactConfirmed', label: '3. Contact details confirmed' },
                { key: 'locationConfirmed', label: '4. Municipality / location verified' },
                { key: 'listingConsentConfirmed', label: '5. Explicit listing publication consent verified' },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2.5 text-xs text-[#2B1C33] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(approvalChecks as any)[c.key]}
                    onChange={(e) =>
                      setApprovalChecks({ ...approvalChecks, [c.key]: e.target.checked })
                    }
                    className="rounded text-[#4A1D8F]"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1">
                Review Notes (min 20 characters)
              </label>
              <textarea
                rows={3}
                value={approvalChecks.reviewNotes}
                onChange={(e) =>
                  setApprovalChecks({ ...approvalChecks, reviewNotes: e.target.value })
                }
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl p-3 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingApp(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#2B1C33] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 py-2.5 bg-[#76A13C] hover:bg-[#5E8230] text-white rounded-xl text-xs font-bold shadow"
              >
                Confirm Approval & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1C33]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C6F0] space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-rose-700">
              Reject Application: {rejectingApp.businessName}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#2B1C33] mb-1">
                Rejection Reason (min 10 characters)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#FFF7F1] border border-[#E9D9EF] rounded-xl p-3 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingApp(null)}
                className="flex-1 py-2.5 bg-stone-100 text-[#2B1C33] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
