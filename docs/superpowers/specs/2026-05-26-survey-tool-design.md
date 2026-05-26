# B2B Survey Tool — Design Spec

- **Date:** 2026-05-26
- **Status:** Approved — implementing. Stack: React + Vite (see §3).
- **First form:** B2BCab.in vendor survey

## 1. Goal & scope

A reusable, **config-driven** survey/form tool. Define a form once as a config object (sections → questions → options → type); a generic React renderer renders it as a multi-step wizard. Responses are stored in a Google Sheet via Google Apps Script. A built-in, passcode-protected analytics dashboard shows per-question results. Sharing is via a public link + QR code.

A **new form means a new config file** — no UI rebuild.

## 2. Locked decisions (from kickoff)

- Config-driven: surveys defined as TS config; one generic renderer.
- Standalone new single-page app (React + Vite — see §3), separate from the cab portal. Free static deploy on Vercel; own URL (e.g. `survey.b2bcab.in` or `*.vercel.app`).
- Backend: Google Apps Script + Google Sheet, reusing the cab portal's proven `fetch` + `mode:'no-cors'` + `text/plain` write pattern. One Sheet tab per form.
- Share: public link + QR generated from the URL.
- Analytics: basic dashboard (per-question counts + charts).
- Data fully owned (own Sheet, own deploy).

## 3. Open decisions — resolved this session

| Decision | Resolution |
|---|---|
| Framework | **React + Vite + TypeScript** (reconsidered from the original Angular pick — lighter bundle, mobile-first, faster to build). Backend/contract unchanged. |
| Analytics location | **In-app coded dashboard** (not Looker Studio / Sheet charts) — keeps everything in one owned, config-driven app. |
| Analytics privacy (PII) | **Private.** Per-form passcode validated **server-side** in Apps Script. Passcode never in the client bundle. Client only ever receives aggregates, not raw phone/earnings. |
| Form UX | **Multi-step wizard** (section-by-section, progress bar, localStorage resume). |
| Validation | Per-question `required` flag + type-based checks (phone, number bounds). |
| Multi-form management | One config file per form in `surveys/`, registered in a slug→config registry. |

## 4. Architecture

### Stack
- **React + Vite + TypeScript** SPA.
- **React Router** for routing.
- **Tailwind CSS v4** (`@tailwindcss/vite`) for mobile-first styling.
- Lightweight custom CSS charts for the dashboard (horizontal bars / stat tiles / response lists) — no chart library needed for v1.
- **`qrcode.react`** for client-side QR (no third-party call).
- Dynamic form state via a custom `useSurveyForm` hook + pure validation functions (no form library — fields are fully config-driven).
- **Vercel** static deploy + `vercel.json` SPA rewrite (all routes → `index.html`); project root = `b2b-forms/`.
- **Backend:** one Apps Script web app bound to one Google Sheet; one tab per form. Routing by a `formId` field. Centralized so the backend is deployed/maintained once.

### Routes
| Route | Purpose |
|---|---|
| `/` | Minimal "no form selected" page; forms are opened by direct slug link |
| `/s/:slug` | The survey wizard |
| `/s/:slug/thanks` | Thank-you screen after submit |
| `/a/:slug` | Analytics dashboard (passcode-gated) |

### Data flow
- **Submit (write):** React form → `fetch` with `mode:'no-cors'`, `Content-Type: text/plain`, body = JSON `{formId, answers}` → Apps Script `doPost` appends a row to the `formId` tab with a server timestamp. Fire-and-forget; on resolve, navigate to `/s/:slug/thanks` and clear the localStorage draft.
- **Analytics (read):** dashboard → CORS-readable GET (JSONP fallback if needed) with `{formId, passcode}` → Apps Script `doGet` validates the passcode against a server-side value, reads the tab, returns **per-question aggregates** as JSON → rendered as lightweight CSS charts. Raw PII never leaves the Sheet except via the explicit, passcode-gated CSV export.

### Folder structure
```
b2b-forms/src/
  core/
    types.ts          # SurveyConfig, Question, Section, QuestionType
    validation.ts     # config-driven pure validators (tested)
    submit.ts         # no-cors write
    analytics.ts      # read aggregates / export
    useSurveyForm.ts  # answers + step + validation + localStorage draft
  surveys/
    b2bcab-vendor.ts
    index.ts          # registry: slug -> SurveyConfig
  components/
    Question.tsx      # switch on type
    Section.tsx       # one wizard step
    Progress.tsx
    charts/           # ChoiceChart, NumberStats, TextResponses
  pages/
    HomePage.tsx
    SurveyPage.tsx    # wizard host
    ThanksPage.tsx
    AnalyticsPage.tsx # passcode gate + dashboard
  config.ts           # Apps Script web-app URL (public endpoint, not secret)
  App.tsx             # router
  main.tsx
```

## 5. Config schema

```ts
type QuestionType =
  | 'short-text' | 'long-text' | 'number' | 'phone'
  | 'single-choice'   // radio
  | 'multi-choice';   // checkboxes

interface Option { value: string; label: string; }

interface Question {
  id: string;            // stable key → Sheet column header; never rename casually
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];    // single/multi-choice
  allowOther?: boolean;  // adds an "Other" choice + free-text → stored in `{id}_other`
  placeholder?: string;
  help?: string;
  min?: number; max?: number;   // number bounds
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface SurveyConfig {
  slug: string;          // URL: /s/:slug
  formId: string;        // routes to the Sheet tab + server-side passcode
  title: string;
  intro?: string;        // shown on first step
  layout: 'wizard' | 'single';   // default 'wizard'
  sections: Section[];
  thanksMessage?: string;
}
```

**The passcode is NOT in the config** — it would ship in the JS bundle. It lives only in Apps Script Script Properties, keyed by `formId`.

## 6. Generic renderer & wizard

- `Question` component switches on `type` to render the correct control (text input, textarea, number input, phone input, radio group, checkbox group; choice controls honor `allowOther`).
- `Section` component renders one wizard step (title, description, its questions).
- `SurveyPage` uses the `useSurveyForm` hook (answers object keyed by question `id`), drives step navigation (Back/Next + progress bar), shows an intro on the first step and a review/submit on the last.
- **Draft persistence:** answers mirrored to `localStorage` keyed by `slug`; restored on load; cleared on successful submit.

## 7. Validation

- Pure functions driven by config: `required`, `phone` (Indian 10-digit / +91 format), `number` (`min`/`max`). Unit-tested.
- Per-step gating: cannot advance past a step containing an invalid required field; errors shown inline.
- Final submit re-validates the whole form.

## 8. Backend contract (Apps Script)

### Sheet structure
- One spreadsheet; **one tab per `formId`**.
- Header row = `timestamp` + one column per question `id`. For `allowOther` questions, an extra `{id}_other` column holds the free text.
- Multi-choice values stored pipe-joined (e.g. `one_way|airport`).

### `doPost` (write)
- Reads `e.postData.contents`, `JSON.parse`s `{formId, answers}`.
- Looks up the tab by `formId` (creates header row if missing), appends `[new Date(), ...answers by column order]`.
- Returns a minimal text response (ignored by the `no-cors` client).

### `doGet` (read / analytics)
- Params: `{formId, passcode, mode}` where `mode` ∈ `aggregate` | `export`.
- Validates `passcode` against `PropertiesService` value for `formId`; on mismatch returns `{error:'unauthorized'}`.
- `aggregate`: per question, returns by type:
  - choice → `{ [optionValue]: count }` (+ `__other` bucket; multi-choice counts may exceed response total)
  - number → `{count, avg, median, min, max, values:[]}`
  - text → `{count, responses:[...]}`
  - **phone → excluded from this payload**
- `export`: returns full rows (all columns incl. phone) for CSV download.
- Output: `ContentService` JSON; CORS-readable. JSONP fallback if cross-origin GET is blocked.

### Privacy
- Passcode per form, server-side only.
- Aggregates computed server-side so the dashboard never downloads raw phone numbers.
- Raw contact details only via the explicit passcode-gated export.

## 9. Analytics dashboard (`/a/:slug`)

- Passcode prompt first; nothing renders until the server validates.
- Auto-builds from the same config:
  - single/multi-choice → bar or pie chart of counts per option.
  - number → stat cards (count/avg/median/min/max) + small histogram.
  - text → response count + expandable list of answers.
- Header: total responses, last response time.
- "Export CSV" button (re-uses the passcode) for raw rows.

## 10. Sharing & QR

- Each form's public link: `https://<host>/s/:slug`.
- The share affordance (copy-link button + QR generated client-side from the URL) lives on the **passcode-gated analytics dashboard** — i.e. the form owner's view — not on the public form. Keeps the public form clean and the QR where the owner manages the form.

## 11. Multi-form management

- `surveys/<name>.ts` exports a `SurveyConfig`.
- `surveys/index.ts` is the registry: `{ [slug]: config }`.
- `/s/:slug` and `/a/:slug` look up the config by slug; unknown slug → not-found.
- New form checklist: add config file → register slug → add Sheet tab → set passcode in Script Properties.

## 12. First form — B2BCab.in vendor survey (full config)

`slug: 'b2bcab-vendor'`, `formId: 'b2bcab_vendor'`, `layout: 'wizard'`.
Required: all Section 1 (Contact) fields. All others optional (maximize completion; trivially adjustable per question).

**Section 1 — Contact** (`contact`)
- `name` — short-text — required
- `business` — short-text — required
- `city` — short-text — required
- `phone` — phone — required

**Section 2 — Your business** (`business`)
- `business_type` — single-choice, allowOther — options: Travel agent · Tour operator · Local cab vendor · Hotel desk
- `monthly_bookings` — number — help: approx bookings per month
- `trip_types` — multi-choice — One Way · Round Trip · Airport Transfer · Local · Outstation
- `top_routes` — long-text — Most-booked cities / routes

**Section 3 — Online presence & customers** (`presence`)
- `online_channels` — multi-choice — Google My Business · JustDial · IndiaMART · Facebook · WhatsApp only · Own website · None
- `customer_source` — multi-choice — Walk-ins · Referrals · Google search · JustDial · Social media · Repeat customers

**Section 4 — Sourcing & platforms** (`sourcing`)
- `sourcing_platforms` — multi-choice — Direct driver network · Other B2B platforms · Aggregators (Savaari, MMT, etc.) · Local fleet owners
- `other_platforms_likes` — long-text — Using other B2B cab platforms? Which, and what you like

**Section 5 — Problems & where B2BCab helps** (`fit`)
- `problems` — multi-choice — Vehicle availability · Pricing · Driver reliability · Payment delays · Cancellations · Support
- `help_most` — multi-choice — Wider availability · Better rates · Faster booking · Reliable drivers · Wider city coverage
- `payment_terms` — single-choice — Pay per booking · Prepaid wallet · Credit · Weekly settlement

**Section 6 — Commercials** (`commercials`)
- `current_earning` — number — Current monthly earning from cab bookings (₹)
- `target_income` — number — Target monthly income via B2BCab (₹)
- `fair_commission` — short-text — Fair commission / margin per booking

**Section 7 — Feedback** (`feedback`)
- `site_feedback` — long-text — Honest feedback on current B2BCab.in site (ease of use / booking flow / clarity / anything confusing or missing)
- `suggestions` — long-text — Suggestions to make it your go-to platform

*Note:* `number` fields show a numeric input with an "approx" hint; if free-form values like "2 lakh" become common, relax those to `short-text` (analytics already best-effort parses).

## 13. Deployment

- **Build:** `npm run build` (Vite) → static `dist/`; `vercel.json` rewrites all routes to `index.html` for SPA deep links.
- **Vercel:** connect repo, framework preset Vite, **Root Directory = `b2b-forms`**, deploy. Custom domain `survey.b2bcab.in` optional.
- **Apps Script:** deploy as web app, execute as owner, access "Anyone". Web-app URL → `b2b-forms/src/config.ts` (public, not secret). Passcodes → Script Properties per `formId`.

## 14. Non-goals / YAGNI (v1)

- No user accounts / real auth (passcode only).
- No conditional/branching logic between questions.
- No file-upload questions.
- No edit-after-submit / response editing.
- No i18n (single language for now).
- No server-side framework / database beyond Sheets.

## 15. Future / possible later

- `layout: 'single'` long-page rendering (schema already supports it).
- Conditional questions (show-if).
- Per-question charts config overrides.
- Multiple spreadsheets if a single sheet grows large.
