// Public Apps Script web-app endpoint. This is NOT a secret (it's a public URL).
// Set VITE_APPS_SCRIPT_URL in your environment / Vercel, or replace the fallback
// below after deploying the Apps Script backend (see docs/SETUP.md).
const env = import.meta.env as unknown as Record<string, string | undefined>;
const ENV_URL = env.VITE_APPS_SCRIPT_URL;

export const APPS_SCRIPT_URL =
  ENV_URL && ENV_URL.length > 0
    ? ENV_URL
    : 'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec';

export const isBackendConfigured = !APPS_SCRIPT_URL.includes('REPLACE_WITH_DEPLOYMENT_ID');

// Canonical public base URL for share links / QR (e.g. https://survey.b2bcab.in).
// Falls back to the current origin so it still works on localhost / preview URLs.
const rawBase = env.VITE_PUBLIC_BASE_URL;
export const PUBLIC_BASE_URL =
  (rawBase && rawBase.replace(/\/+$/, '')) ||
  (typeof window !== 'undefined' ? window.location.origin : '');
