import type { Answers, AnswerValue, Question, Section, SurveyConfig } from './types';

/** Indian mobile: 10 digits starting 6-9, optionally with +91 / 0 / 91 prefix. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 11 && digits.startsWith('0')) return /^[6-9]\d{9}$/.test(digits.slice(1));
  if (digits.length === 12 && digits.startsWith('91')) return /^[6-9]\d{9}$/.test(digits.slice(2));
  return false;
}

function isEmpty(value: AnswerValue | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim() === '';
}

/** Returns an error message, or null when the answer is valid. */
export function validateQuestion(q: Question, value: AnswerValue | undefined): string | null {
  if (isEmpty(value)) return q.required ? 'This field is required' : null;

  if (q.type === 'phone' && typeof value === 'string' && !isValidPhone(value)) {
    return 'Enter a valid phone number';
  }

  if (q.type === 'number' && typeof value === 'string') {
    const n = Number(value);
    if (!Number.isFinite(n)) return 'Enter a valid number';
    if (q.min !== undefined && n < q.min) return `Must be at least ${q.min}`;
    if (q.max !== undefined && n > q.max) return `Must be at most ${q.max}`;
  }

  return null;
}

export function validateSection(section: Section, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of section.questions) {
    const err = validateQuestion(q, answers[q.id]);
    if (err) errors[q.id] = err;
  }
  return errors;
}

export function validateSurvey(config: SurveyConfig, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of config.sections) {
    Object.assign(errors, validateSection(section, answers));
  }
  return errors;
}
