import type { SurveyConfig } from './types';

/** Ordered Sheet columns for a survey (question ids + `${id}_other` for allowOther). */
export function surveyColumns(config: SurveyConfig): string[] {
  const cols: string[] = [];
  for (const section of config.sections) {
    for (const q of section.questions) {
      cols.push(q.id);
      if (q.allowOther) cols.push(`${q.id}_other`);
    }
  }
  return cols;
}

/**
 * Compact per-field aggregation spec sent to the backend so it can aggregate
 * generically without knowing the config. Codes: c=choice, n=number, t=text,
 * x=exclude (PII like phone — never aggregated/returned).
 */
export function fieldSpec(config: SurveyConfig): string {
  const parts: string[] = [];
  for (const section of config.sections) {
    for (const q of section.questions) {
      let kind: 'c' | 'n' | 't' | 'x';
      switch (q.type) {
        case 'single-choice':
        case 'multi-choice':
          kind = 'c';
          break;
        case 'number':
          kind = 'n';
          break;
        case 'phone':
          kind = 'x';
          break;
        default:
          kind = 't';
      }
      if (q.excludeFromAnalytics) kind = 'x';
      parts.push(`${q.id}:${kind}`);
      if (q.allowOther) parts.push(`${q.id}_other:t`);
    }
  }
  return parts.join(',');
}
