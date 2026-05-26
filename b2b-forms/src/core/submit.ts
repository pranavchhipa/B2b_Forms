import { APPS_SCRIPT_URL } from '../config';
import type { Answers } from './types';

/**
 * Fire-and-forget write to Apps Script. With `mode: 'no-cors'` the browser sends
 * a "simple" request (text/plain avoids a CORS preflight) and the response is
 * opaque — so this resolves once the request is sent, not when the row is written.
 * Mirrors the cab portal's proven feedback-service pattern.
 */
export async function submitResponse(
  formId: string,
  answers: Answers,
  columns: string[],
): Promise<void> {
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ formId, columns, answers }),
  });
}
