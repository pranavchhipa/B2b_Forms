# B2B Survey Tool — Setup & Deploy

A config-driven survey tool. The React app lives in `b2b-forms/`, the backend is a
Google Apps Script (`apps-script/Code.gs`) writing to a Google Sheet.

First form: **B2BCAB Vendor Survey** — `slug: b2bcab-vendor`, `formId: b2bcab_vendor`.

---

## 1. Run locally

```bash
cd b2b-forms
npm install        # already done if you scaffolded here
npm run dev        # http://localhost:5173
npm test           # run unit tests
npm run build      # type-check + production build → dist/
```

- Public form: `http://localhost:5173/s/b2bcab-vendor`
- Analytics (passcode): `http://localhost:5173/a/b2bcab-vendor`

Until the backend is configured you'll see a "backend not configured" notice and
submissions won't be saved.

---

## 2. Backend — Google Sheet + Apps Script

1. Create a new **Google Sheet** (this stores all responses; one tab per form,
   auto-created on first submission).
2. In the Sheet: **Extensions → Apps Script**. Delete the sample code and paste the
   full contents of [`apps-script/Code.gs`](../apps-script/Code.gs). Save.
3. **Deploy → New deployment → Web app**
   - Description: `survey backend`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, then authorize the permissions prompt.
   - Copy the **Web app URL** (ends in `/exec`).
4. **Project Settings (gear) → Script Properties → Add script property**, one per form:
   - Property: `passcode_b2bcab_vendor`
   - Value: *your secret passcode* (used to view the analytics dashboard)

   The property key is always `passcode_<formId>`.

---

## 3. Point the frontend at the backend

The Apps Script URL is **not a secret** (it's a public endpoint). Set it via env var:

Create `b2b-forms/.env.local`:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

(or edit the fallback in `b2b-forms/src/config.ts`). Restart `npm run dev`.

Test: submit the form, confirm a row lands in the Sheet's `b2bcab_vendor` tab. Then
open `/a/b2bcab-vendor`, enter the passcode, and verify the dashboard loads.

---

## 4. Deploy to Vercel (free)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → import the repo.**
   - **Root Directory: `b2b-forms`** (important — the app is in a subfolder)
   - Framework preset: **Vite** (auto-detected)
3. **Settings → Environment Variables**: add `VITE_APPS_SCRIPT_URL` = your `/exec` URL.
4. Deploy. `vercel.json` already handles SPA deep links (`/s/...`, `/a/...`).
5. (Optional) Add a custom domain like `survey.b2bcab.in`.

Share the form: `https://<your-domain>/s/b2bcab-vendor` (link + QR are on the
passcode-gated dashboard at `/a/b2bcab-vendor`).

---

## 5. Add another form later

1. Create `b2b-forms/src/surveys/<name>.ts` exporting a `SurveyConfig`
   (copy `b2bcab-vendor.ts` as a template; give it a unique `slug` and `formId`).
2. Register it in `b2b-forms/src/surveys/index.ts`.
3. Add a Script Property `passcode_<formId>` in Apps Script.
4. Done — the Sheet tab is created automatically on the first response. No UI changes.

---

## Privacy notes

- The analytics dashboard is passcode-gated; the passcode is validated **server-side**
  and never ships in the frontend bundle.
- Aggregates are computed in Apps Script, so the dashboard never downloads raw phone
  numbers. Phone is excluded from the dashboard entirely and only appears in the
  passcode-gated **CSV export**.
