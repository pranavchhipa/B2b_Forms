import { APPS_SCRIPT_URL } from '../config';

export type QuestionAggregate =
  | { type: 'choice'; counts: Record<string, number> }
  | { type: 'number'; count: number; avg: number; median: number; min: number; max: number }
  | { type: 'text'; count: number; responses: string[] }
  | { type: 'skip' };

export interface AggregateResult {
  total: number;
  lastResponse: string | null;
  questions: Record<string, QuestionAggregate>;
}

/**
 * Reads from Apps Script via JSONP. Apps Script web apps are unreliable for
 * cross-origin `fetch` (redirects + missing CORS headers), so a <script> tag
 * with a callback is the robust way to read JSON back into the dashboard.
 */
function jsonp<T>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const cbName = `__jsonp_cb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const w = window as unknown as Record<string, ((data: T) => void) | undefined>;
    const script = document.createElement('script');
    let timer: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      clearTimeout(timer);
      delete w[cbName];
      script.remove();
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out. Check the Apps Script URL is correct and deployed.'));
    }, 20000);

    w[cbName] = (data: T) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('Could not reach the backend.'));
    };
    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cbName}`;
    document.body.appendChild(script);
  });
}

export async function fetchAggregates(
  formId: string,
  passcode: string,
  fields: string,
): Promise<AggregateResult> {
  const url =
    `${APPS_SCRIPT_URL}?mode=aggregate` +
    `&formId=${encodeURIComponent(formId)}` +
    `&passcode=${encodeURIComponent(passcode)}` +
    `&fields=${encodeURIComponent(fields)}`;
  const data = await jsonp<AggregateResult & { error?: string }>(url);
  if (data.error) {
    throw new Error(data.error === 'unauthorized' ? 'Wrong passcode.' : data.error);
  }
  return data;
}

/** Direct URL the browser can navigate to for a CSV download (passcode-gated). */
export function exportCsvUrl(formId: string, passcode: string): string {
  return (
    `${APPS_SCRIPT_URL}?mode=export` +
    `&formId=${encodeURIComponent(formId)}` +
    `&passcode=${encodeURIComponent(passcode)}`
  );
}
