# Enterseed Platform

Enterseed is an MSME support website focused on South Cotabato and nearby SOCCSKSARGEN communities. The Marketing workspace brings strategy tools, the reviewed supplier directory, its map, and the listing application together in one page.

This project also includes a Boss Narra-oriented product concept for a more complete MSME platform: a purple-and-orange web/mobile experience with language-aware onboarding, grounded AI assistance, finance and marketing modules, and filing support workflows.

This is a small Node/Express deployment, not a static-only site. The server stores submissions in SQLite and serves the HTML pages and API from one origin. Payment processing, government filing, supplier identity checks, and professional legal or financial advice are not provided.

## Public deployment (GitHub Pages + Render)

The static website can be published at `https://tdalog-cell.github.io/EnterSeed/` without asking visitors to install Node.js or run `npm start`. GitHub Pages serves the HTML, CSS, and browser JavaScript; the Express API and SQLite data remain on Render.

1. In GitHub, create a repository variable named `ENTERSEED_API_URL` with the HTTPS origin of the Render API (for example, `https://enterseed-api.onrender.com`, with no path or trailing slash).
2. In Render, create a Blueprint from this repository using `render.yaml`. Review the current price before creating the paid web service and persistent disk. Keep the generated `ADMIN_API_KEY` private; add optional AI and email credentials in Render's environment settings.
3. Wait for the Render service to become healthy at `/api/health`, then save its HTTPS origin in the GitHub variable.
4. In the repository's **Settings → Pages**, choose **GitHub Actions** as the deployment source. Push or merge the workflow to `main`, or run **Deploy GitHub Pages** manually after the variable is set.
5. Open `https://tdalog-cell.github.io/EnterSeed/`. The public welcome page is `index.html`; protected tools redirect unauthenticated visitors to the sign-in page. The integrated supplier directory and application are in Marketing.

The Pages build fails intentionally if `ENTERSEED_API_URL` is missing or is not an HTTPS origin. The Render API allows browser requests only from the configured Pages origin. Cross-origin sign-in returns an opaque session token to that origin; the browser stores it in session storage by default, or local storage when “Keep me signed in” is selected. The server stores only a hash of the token. Never publish API or admin secrets in GitHub variables used by the static build.

To check the static artifact locally, set `ENTERSEED_API_URL` to a valid HTTPS backend origin and run `node scripts/build-pages.mjs`; this builds `dist/` but does not deploy it.

## Boss Narra platform blueprint

### Recommended stack

- Web: Next.js + TypeScript + Tailwind CSS
- Mobile: React Native + Expo
- Backend: Node.js + NestJS/Fastify
- AI grounding: Python FastAPI + LLM gateway + policy checks
- Data: PostgreSQL + Prisma + Redis
- Auth: Supabase Auth or Auth0
- Document generation: PDF and filing-ready packet automation

### Core modules

1. Authentication and onboarding
   - Secure login and registration
   - Password recovery and profile management
   - Language choice for English, Tagalog, and Hiligaynon
2. Boss Narra assistant
   - Business recommendations for finance, marketing, and operations
   - Strict grounding to DTI, DOST, BIR, and local public resources
   - Safety policies to prevent legal, tax, and financial hallucinations
3. Practice sets and e-filing
   - Filing-ready document generation
   - Watermarked outputs and readiness tagging
   - Official portal routing for government workflows
4. Finance engine
   - Cash flow and debt analysis
   - Recommendation modules for tax, debt, cash management, and investment planning
5. Marketing engine
   - 4Ps recommendations and pricing analysis
   - Location and promotion tooling

### State management and component logic

- Use React Query/TanStack Query for server-backed dashboard data and caching.
- Use Zustand for localized onboarding and assistant state.
- Keep a typed global model for locale, business-stage assessment, assistant thread, and finance/marketing recommendations.
- Build reusable cards, forms, and modal components to keep the mobile and web experiences consistent.

### Implementation phases

1. Database schema and consent tables
2. Design system and token creation
3. Authentication and onboarding with language preference
4. Feature module rollout for Boss Narra, finance, and marketing
5. Validation, e2e tests, and source-grounding checks

### Current authentication scope

- Registration and sign-in use the existing Express API, SQLite user records, Node `scrypt` password hashes, and random server-side sessions.
- Registered accounts persist in the server's SQLite database; passwords are stored as scrypt hashes, never in IndexedDB or other browser storage.
- Session IDs are stored as SHA-256 hashes in SQLite. Same-origin deployments use `HttpOnly`, `SameSite=Strict` cookies; production cookies also use `Secure`. The allowlisted GitHub Pages origin receives a session token for its cross-origin API calls, stored in browser session storage by default or local storage when “Keep me signed in” is selected.
- First-time sign-in requires a saved language preference (English, Filipino, or Hiligaynon). Hiligaynon is recorded, but parts of the interface still fall back to English.
- Password recovery, email verification, social sign-in, and profile-management screens are not implemented. Configure and test these flows before production use.
- This is a prototype authentication baseline, not a substitute for a production security assessment, deployment hardening, or privacy/legal review.

### Core MSME sprint

- Login and registration use a navigation-free public layout; authenticated workspace pages are mounted inside the shared `js/app-shell.js` AppShell.
- `/dashboard`, `/finance`, `/marketing`, `/documents`, and `/boss-nana` are checked against the server session before static page content is served. Unauthenticated requests redirect to `/login` with a safe return path.
- Desktop workspace navigation lives in the persistent left sidebar; the top utility bar contains breadcrumbs, language, profile, and logout controls. Mobile uses the shared top bar and fixed five-item bottom navigation.
- The finance assessment lives at `/finance`, stores each user's explicitly consented monthly income, expenses, cash, debt, debt payment, other assets/liabilities, and self-reported tax standing in `finance_assessments`, and powers an account-specific overview on `/dashboard`.
- `GET /api/finance/assessment`, `PUT /api/finance/assessment`, and `DELETE /api/finance/assessment` require the existing authenticated session and operate only on that session's account.
- Dashboard outputs are estimates: monthly P&L, a simple asset/liability/equity snapshot, and operating cash after reported debt payments. They are not audited financial statements or professional advice.
- `POST /api/boss-nana` is authenticated and returns source links with cautious fallback answers. If Gemini is configured, its prompt explicitly treats links as unverified signposts, not retrieved evidence; verify tax, legal, and government requirements directly with DTI, DOST, or BIR.
- The floating Boss Narra widget is mounted inside each authenticated workspace and never sends finance form values to chat.
- English and Filipino compatibility strings and structured `messages` catalogs live in `locales/en.json`, `locales/fil.json`, and `locales/hil.json`. Hiligaynon missing keys fall back to the English catalog, then to the source key. The remaining exact-English legacy strings are temporarily under each catalog's `legacy` map.
- Finance figures are sensitive. This prototype stores them in local SQLite without encryption at rest; do not use real financial data in production until encrypted storage, retention/deletion policy, backups, and access controls have been reviewed.

### Verify the new flows

1. Start the server with `npm start`; confirm `/login` and `/register` contain no application navigation.
2. Visit `/dashboard`, `/finance`, `/marketing`, `/documents`, and `/boss-nana` without a session; each should redirect to `/login` without showing workspace navigation or content.
3. Register an account, select a language when prompted, then visit each workspace route. Confirm the same sidebar and top utility bar remain in place while breadcrumbs and active navigation update.
4. Confirm sign-in without a requested page opens `/dashboard`; use the account menu’s “Main website” link to return to `/`. On mobile, verify the floating assistant does not cover the bottom navigation.
5. Visit `/finance` and complete the assessment. Submit again after changing a value; reload to confirm the values and recommendations persist for that account.
6. Use “Delete my saved assessment” and reload to confirm the assessment was removed. Log in as another account to confirm it cannot see the first account's figures.
7. Open Boss Narra from the utility bar or floating button. Ask a tax or filing question and check that official source links and the verification disclaimer appear.
8. Switch to Filipino and Hiligaynon using the language control. Confirm untranslated Hiligaynon keys render their English values and the layout remains usable at mobile widths.
9. Open `/api/finance/assessment` or `/api/boss-nana` without a session and confirm they return `401`.


## Architecture

```text
enterseed-platform/
├── css/
│   ├── main.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── public-assistant.js
│   ├── document-generator.js
│   ├── auth.js
│   ├── auth-guard.js
│   ├── app-shell.js
│   ├── dashboard.js
│   ├── assistant-widget.js
│   ├── finance.js
│   ├── i18n.js
│   ├── supplier-hub.js
│   ├── pricing.js
│   ├── form-handler.js
│   └── admin.js
├── locales/
│   ├── en.json
│   ├── fil.json
│   └── hil.json
├── logos/                   # User-provided brand marks
├── server/
│   ├── data/                # Runtime SQLite file; ignored by Git
│   └── index.js             # Same-origin API, validation, retention, review gates
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── finance.html
├── marketing.html
├── documents.html
├── efiling.html
├── pricing.html
├── about.html
├── onboarding.html
├── admin.html               # Noindex staff review console
├── .env.example
└── README.md
```

## Run locally

Requirements: Node.js 22.13+ (Node 24 recommended) and npm.

```powershell
cd enterseed-platform
npm install
Copy-Item .env.example .env
```

Set a fresh `ADMIN_API_KEY` value in `.env` before using the staff review console. Generate one locally with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Then start the API and website:

```powershell
npm start
```

Open `http://127.0.0.1:5173`. `npm run dev` starts Node watch mode. The previous Python static server cannot support API submissions; use this Express server instead. Do not commit `.env`, `server/data/*.sqlite`, or API credentials.

## Environment settings

Copy `.env.example` to `.env` and set:

- `ADMIN_API_KEY`: unique high-entropy secret required by `/admin.html` and `/api/admin/*`.
- `GEMINI_API_KEY`: optional server-only Google AI Studio key. Leave empty to use the offline source-aware fallback.
- `GEMINI_MODEL`: optional model override; defaults to `gemini-2.5-flash`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`: optional Resend email notification settings. Without these, inquiries still enter the staff queue and the UI says email notification is not configured.
- `NOMINATIM_USER_AGENT`: identify your deployed app and include a real contact route as required by Nominatim’s usage policy.
- `HOST`, `PORT`, `DATABASE_PATH`: server binding and SQLite path. The local default binds to `127.0.0.1`; configure a trusted host and HTTPS reverse proxy for deployment.
- `TRUST_PROXY=true`: enable only when the app is actually behind a correctly configured trusted reverse proxy.

The admin key and AI/email keys are secrets. Never paste them into chat, commit them, or put them in browser JavaScript. Use your hosting provider’s secret manager for deployment.

## Supplier opt-in and review

The public API returns only records with `status=active`, a recorded `verified_at`, and an unexpired annual review. New applications are private and pending. They are not “verified” merely because someone submitted a form.

Staff open `/admin.html`, enter `ADMIN_API_KEY`, then review the pending queue. Approval requires checking all five controls:

1. Applicant identity.
2. Business evidence.
3. Contact details.
4. Municipality/location.
5. Explicit permission to publish the listing.

Enter meaningful review notes before approving. Follow up with the applicant through their private email to request supporting documents through an appropriate secure channel; the public form does not accept identity-document uploads. Approved listings show the review date and expire from the public directory after 12 months unless reviewed again. Withdrawal clears contact details and removes the listing from public search. Keep this review process assigned to a real staff owner before accepting public applications.

Public contact details are optional and require a separate checkbox. Otherwise visitors can ask Enterseed to make an introduction. Supplier and map data are not seeded with fictional companies or addresses.

## Privacy and retention

- Readiness assessment: collects stage, chosen needs, municipality, and consent only; it does not ask for name, email, phone, or account. Data is stored server-side for up to 30 days. A random deletion token is held in `sessionStorage` for the current browser session so the visitor can request immediate deletion. The token is not the assessment data.
- Contact inquiries: requires consent and is retained for up to 180 days. `/admin.html` provides authorized support staff a queue, reply link, and delete action. Configure Resend if email alerts are needed; otherwise staff must check the queue.
- Pending supplier applications: private contact and listing details are retained up to 90 days. Rejected applications are retained for up to 30 days after decision. Approved private contact information is retained while the listing is active and cleared when the listing is withdrawn or annual review expires. Public listings are unpublished after one year unless approved again.
- SQLite is stored under `server/data/` and excluded from Git. This does not by itself provide production-grade encryption at rest, backups, or data-subject workflows. For deployment, use encrypted storage, restricted host access, protected backups, HTTPS, a privacy notice reviewed for applicable Philippine data-protection requirements, and a named data controller. Staff must honor deletion requests and keep access credentials private.

## Contact and email

The browser posts contact forms to `/api/inquiries`; it does not call Formspree directly. To enable notification, create a [Resend](https://resend.com/) account, verify a sending domain, and set the three Resend environment variables. The API stores the inquiry before attempting notification and reports whether email was delivered. For a small pilot, check the staff inquiry queue regularly even if Resend is configured.

Supplier applications similarly enter the private queue and notify the support mailbox if configured. Supplier introduction requests are sent only for active, reviewed listings. The visitor explicitly agrees before their message is forwarded.

## AI and source review

The browser calls `/api/assistant`; the Gemini key stays on the server. Configure `GEMINI_API_KEY` using Google AI Studio and review the provider’s current model availability, free-tier quota, privacy, and terms. If the key is unset or the request fails, the server returns conservative local fallback guidance.

The public Boss Narra widget is implemented in `js/public-assistant.js` and uses the same-origin assistant endpoint without persisting chat history. Its launcher is shared across public pages; the business-tools page opens this widget rather than creating a second chat client. Local document outline generation is isolated in `js/document-generator.js` and does not send form data to the server. Requests accept `question`, optional `history`, and optional `language` (`en` or `fil`); omitting `language` keeps existing clients on English. The shared language selector and Filipino translations are in `js/language.js`, with the preference stored in the visitor’s browser.

Each answer includes relevant source links and a **last link checked** date. Link-check date does not mean the source’s policy content was fully reviewed. As of 2026-10-19, the official South Cotabato and Koronadal sites were reachable. DTI’s BNRS portal rate-limited automated access, and the DTI FAQ content could not be independently fetched; those limitations are shown in the UI. Recheck source content periodically and update the date and review note only after a person verifies it. The fallback is a prompt/reference snippet, not a full searchable legal knowledge base or production RAG system.

## Maps

Leaflet 1.9.4 and OpenStreetMap tiles are loaded from public endpoints; attribution is displayed. Nominatim requests are proxied by the server, use `NOMINATIM_USER_AGENT`, are limited to one request per IP per second, and are cached for 30 days. Lookups are user-initiated and municipality-level; the app does not geocode applicants in bulk. Configure the user-agent with your real app identity and contact route before deployment. Follow the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/). Public services can rate-limit or change; use a compliant provider or host your own service as traffic grows.

## API route summary

- `GET /api/health`
- `GET /api/suppliers`
- `GET /api/places/search?q=...`
- `POST /api/assistant`
- `POST /api/readiness` and `DELETE /api/readiness/:deleteToken`
- `POST /api/inquiries`
- `POST /api/supplier-applications`
- `POST /api/suppliers/:id/contact`
- Authenticated `GET /api/admin/supplier-applications`, `POST /api/admin/supplier-applications/:id/approve`, `POST /api/admin/supplier-applications/:id/reject`, `GET /api/admin/suppliers`, `POST /api/admin/suppliers/:id/withdraw`, `DELETE /api/admin/suppliers/:id`, `GET /api/admin/inquiries`, and `DELETE /api/admin/inquiries/:id`.

All JSON input is validated with Zod, public submissions are rate-limited, security headers are enabled, and the admin API uses bearer authentication. Review the implementation and deployment environment before handling real personal or business records.
