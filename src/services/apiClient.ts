/**
 * Robust API Client with Dual-Mode Support:
 * 1. Full-Stack Server Mode: Uses real Express / SQLite backend when reachable.
 * 2. Static GitHub Pages Mode: When running as a static site on GitHub Pages without a backend server,
 *    gracefully falls back to browser-level localStorage persistence and local offline AI guidance so all features work seamlessly.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Seed initial demo data for client-side GitHub Pages storage if empty
const defaultSuppliers = [
  {
    id: 1,
    name: 'Matutum Agri-Packaging Solutions',
    category: 'packaging',
    location: 'Polomolok, South Cotabato',
    products: 'Corrugated boxes, eco-friendly banana leaves trays, vacuum pouches for dried fruit',
    publicEmail: 'inquiries@matutumpackaging.example.ph',
    publicPhone: '+63 83 228 4101',
    website: 'https://matutumpackaging.example.ph',
    verifiedAt: '2026-10-15T08:00:00Z'
  },
  {
    id: 2,
    name: 'South Cotabato Coffee Producers Hub',
    category: 'raw-materials',
    location: 'Tupi, South Cotabato',
    products: 'Green coffee beans, roasted Arabica and Robusta, processing equipment rentals',
    publicEmail: 'sales@sotcotcoffee.example.ph',
    publicPhone: '+63 917 555 3821',
    website: 'https://sotcotcoffee.example.ph',
    verifiedAt: '2026-10-18T09:30:00Z'
  },
  {
    id: 3,
    name: 'Koronadal Digital Marketing & Media',
    category: 'marketing',
    location: 'City of Koronadal',
    products: 'Social media management, DTI brand registration packages, product photography',
    publicEmail: 'support@koronadaldigital.example.ph',
    publicPhone: '+63 83 228 9942',
    website: 'https://koronadaldigital.example.ph',
    verifiedAt: '2026-10-20T11:00:00Z'
  },
  {
    id: 4,
    name: 'Sebu Artisanal Weaving Cooperative',
    category: 'raw-materials',
    location: 'Lake Sebu, South Cotabato',
    products: 'T’nalak abaca textile, natural dye extracts, brassware hardware for bags',
    publicEmail: 'order@lake-sebu-tnalak.example.ph',
    publicPhone: '+63 920 441 8892',
    website: 'https://lake-sebu-tnalak.example.ph',
    verifiedAt: '2026-10-22T14:15:00Z'
  },
  {
    id: 5,
    name: 'Surallah Cold Chain & Logistics',
    category: 'services',
    location: 'Surallah, South Cotabato',
    products: 'Temperature-controlled van delivery across SOCCSKSARGEN, pallet storage',
    publicEmail: 'dispatch@surallahlogistics.example.ph',
    publicPhone: '+63 83 238 1234',
    website: 'https://surallahlogistics.example.ph',
    verifiedAt: '2026-10-25T16:00:00Z'
  }
];

const referenceSources = [
  { label: 'DTI Business Name Registration System (BNRS)', url: 'https://bnrs.dti.gov.ph/' },
  { label: 'Bureau of Internal Revenue (BIR)', url: 'https://www.bir.gov.ph/' },
  { label: 'DOST Regional Office 12', url: 'https://www.dost.gov.ph/' },
  { label: 'South Cotabato Provincial Services', url: 'https://southcotabato.gov.ph/services/' },
  { label: 'City Government of Koronadal', url: 'https://koronadal.gov.ph/' }
];

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      credentials: API_BASE ? 'include' : 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    // If server responded with valid API response (not an HTML 404 from GitHub Pages static routing)
    const contentType = res.headers.get('content-type') || '';
    if (res.ok || (contentType.includes('application/json') && res.status !== 404)) {
      return res;
    }

    // If 404 on static host (e.g. GitHub Pages), fallback to mock handler
    if (res.status === 404 || contentType.includes('text/html')) {
      return handleClientFallback(endpoint, options);
    }

    return res;
  } catch {
    // Network failure (no backend running, e.g. GitHub Pages static offline)
    return handleClientFallback(endpoint, options);
  }
}

/** In-browser storage fallback when running on static hosts like GitHub Pages */
function handleClientFallback(endpoint: string, options: RequestInit): Response {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Health
  if (endpoint === '/api/health') {
    return makeResponse(200, { ok: true, emailConfigured: false, mode: 'github-pages-client' });
  }

  // 2. Auth: Register
  if (endpoint === '/api/auth/register' && method === 'POST') {
    const users = JSON.parse(localStorage.getItem('enterseed_users') || '[]');
    const existing = users.find((u: any) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return makeResponse(409, { error: 'An account with this email already exists.' });
    }
    const newUser = {
      id: Date.now(),
      email: body.email.toLowerCase(),
      firstName: body.firstName,
      lastName: body.lastName,
      business: body.business,
      preferredLanguage: ''
    };
    users.push(newUser);
    localStorage.setItem('enterseed_users', JSON.stringify(users));
    localStorage.setItem('enterseed_current_user', JSON.stringify(newUser));
    return makeResponse(201, {
      user: newUser,
      needsLanguageSelection: true,
      sessionToken: `ghpages-${Date.now()}`
    });
  }

  // 3. Auth: Login
  if (endpoint === '/api/auth/login' && method === 'POST') {
    const users = JSON.parse(localStorage.getItem('enterseed_users') || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === body.email.toLowerCase()) || {
      id: Date.now(),
      email: body.email,
      firstName: 'MSME',
      lastName: 'Owner',
      business: 'Local Enterprise (South Cotabato)',
      preferredLanguage: 'en'
    };
    localStorage.setItem('enterseed_current_user', JSON.stringify(user));
    return makeResponse(200, {
      user,
      needsLanguageSelection: !user.preferredLanguage,
      sessionToken: `ghpages-${Date.now()}`
    });
  }

  // 4. Auth: Me
  if (endpoint === '/api/auth/me') {
    const user = JSON.parse(localStorage.getItem('enterseed_current_user') || 'null');
    if (user) {
      return makeResponse(200, { user });
    }
    return makeResponse(401, { error: 'Please log in to continue.' });
  }

  // 5. Auth: Language
  if (endpoint === '/api/auth/language' && method === 'PATCH') {
    const user = JSON.parse(localStorage.getItem('enterseed_current_user') || 'null');
    if (user) {
      user.preferredLanguage = body.language;
      localStorage.setItem('enterseed_current_user', JSON.stringify(user));
    }
    return makeResponse(200, { preferredLanguage: body.language });
  }

  // 6. Auth: Logout
  if (endpoint === '/api/auth/logout') {
    localStorage.removeItem('enterseed_current_user');
    return new Response(null, { status: 204 });
  }

  // 7. Finance: Get assessment
  if (endpoint === '/api/finance/assessment' && method === 'GET') {
    const saved = localStorage.getItem('enterseed_finance_assessment');
    return makeResponse(200, { assessment: saved ? JSON.parse(saved) : null });
  }

  // 8. Finance: Save assessment
  if (endpoint === '/api/finance/assessment' && method === 'PUT') {
    localStorage.setItem('enterseed_finance_assessment', JSON.stringify({ ...body, updatedAt: new Date().toISOString() }));
    return makeResponse(200, { saved: true });
  }

  // 9. Finance: Delete assessment
  if (endpoint === '/api/finance/assessment' && method === 'DELETE') {
    localStorage.removeItem('enterseed_finance_assessment');
    return new Response(null, { status: 204 });
  }

  // 10. Boss Narra AI / Assistant
  if (endpoint.startsWith('/api/boss-nana') || endpoint.startsWith('/api/assistant')) {
    const q = (body.question || '').toLowerCase();
    const lang = body.language || 'en';

    let answer = 'I can help guide you on financing, registration, and marketing for South Cotabato MSMEs. Always verify requirements directly with official government agencies.';
    if (/dti|business name|registration|rehistro/i.test(q)) {
      answer = lang === 'fil'
        ? 'Para sa pagpaparehistro ng business name (sole proprietorship), gamitin ang opisyal na DTI BNRS portal. Tiyaking maghanda ng 1 valid ID at bayad na ₱200 hanggang ₱2,000 depende sa sakop.'
        : 'For sole proprietorship business name registration, access the official DTI BNRS portal. Prepare one valid government ID and registration fees ranging from ₱200 to ₱2,000 depending on territorial scope.';
    } else if (/bir|tax|buwis/i.test(q)) {
      answer = lang === 'fil'
        ? 'Magrehistro sa BIR gamit ang Form 1901 para sa self-employed o negosyo. Dalhin ang iyong DTI certificate, Mayor’s permit, at books of accounts sa RDO sa inyong lugar.'
        : 'Register with the BIR using Form 1901 for self-employed/single proprietors. Bring your DTI certificate, Mayor’s permit, and books of accounts to your local Revenue District Office.';
    } else if (/permit|mayor|lgu|koronadal/i.test(q)) {
      answer = lang === 'fil'
        ? 'Kailangan ng Barangay Business Clearance, Sanitary Permit, at Fire Inspection Certificate (FSIC) bago maibigay ang Mayor’s Permit sa Business Permits and Licensing Office (BPLO).'
        : 'A Barangay Business Clearance, Sanitary Permit, and Fire Safety Inspection Certificate (FSIC) are required prior to issuance of the Mayor’s Permit by the City/Municipal BPLO.';
    } else if (/loan|bank|capital|pondo/i.test(q)) {
      answer = lang === 'fil'
        ? 'Maaari kang sumangguni sa Land Bank of the Philippines para sa mga programang pautang sa MSME at agrikultura. Maghanda ng feasibility study at financial records.'
        : 'Consult Land Bank of the Philippines or accredited cooperatives for MSME credit windows. Prepare your financial statements, business plan outline, and supplier quotations.';
    }

    return makeResponse(200, {
      answer,
      mode: 'grounded-local-orientation',
      sources: referenceSources
    });
  }

  // 11. Suppliers: List
  if (endpoint === '/api/suppliers' && method === 'GET') {
    const stored = JSON.parse(localStorage.getItem('enterseed_suppliers') || 'null');
    const suppliers = stored || defaultSuppliers;
    return makeResponse(200, { suppliers });
  }

  // 12. Suppliers: Apply
  if (endpoint === '/api/supplier-applications' && method === 'POST') {
    const apps = JSON.parse(localStorage.getItem('enterseed_supplier_applications') || '[]');
    apps.push({ ...body, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem('enterseed_supplier_applications', JSON.stringify(apps));
    return makeResponse(201, { received: true, status: 'pending_review', retentionDays: 90 });
  }

  // 13. Suppliers: Contact
  if (endpoint.includes('/contact') && method === 'POST') {
    return makeResponse(201, { received: true, forwarded: false, reference: Date.now() });
  }

  // 14. Readiness: Submit
  if (endpoint === '/api/readiness' && method === 'POST') {
    return makeResponse(201, { received: true, deleteToken: `token-${Date.now()}`, retentionDays: 30 });
  }

  // 15. Inquiries: Submit
  if (endpoint === '/api/inquiries' && method === 'POST') {
    const inqs = JSON.parse(localStorage.getItem('enterseed_inquiries') || '[]');
    inqs.push({ ...body, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem('enterseed_inquiries', JSON.stringify(inqs));
    return makeResponse(201, { received: true, reference: Date.now(), retentionDays: 180 });
  }

  // 16. Admin Endpoints
  if (endpoint.startsWith('/api/admin')) {
    const apps = JSON.parse(localStorage.getItem('enterseed_supplier_applications') || '[]');
    const storedSuppliers = JSON.parse(localStorage.getItem('enterseed_suppliers') || 'null') || defaultSuppliers;
    const inqs = JSON.parse(localStorage.getItem('enterseed_inquiries') || '[]');

    if (endpoint === '/api/admin/supplier-applications') {
      return makeResponse(200, { applications: apps });
    }
    if (endpoint === '/api/admin/suppliers') {
      return makeResponse(200, { suppliers: storedSuppliers });
    }
    if (endpoint === '/api/admin/inquiries') {
      return makeResponse(200, { inquiries: inqs });
    }
    if (endpoint.includes('/approve')) {
      return makeResponse(201, { approved: true, supplierId: Date.now(), verifiedAt: new Date().toISOString() });
    }
  }

  return makeResponse(200, { ok: true });
}

function makeResponse(status: number, data: any): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Enterseed-Mode': 'client-storage-adapter'
    }
  });
}
