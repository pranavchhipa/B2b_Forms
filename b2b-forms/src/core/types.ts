export type QuestionType =
  | 'short-text'
  | 'long-text'
  | 'number'
  | 'phone'
  | 'single-choice'
  | 'multi-choice';

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];
  /** Adds an "Other" choice; its free text is stored under `${id}_other`. */
  allowOther?: boolean;
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  /** Keep this answer out of the analytics dashboard (still saved to the Sheet + CSV). */
  excludeFromAnalytics?: boolean;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface SurveyConfig {
  /** URL slug: /s/:slug */
  slug: string;
  /** Routes to the Sheet tab + the server-side passcode. */
  formId: string;
  title: string;
  intro?: string;
  layout?: 'wizard' | 'single';
  sections: Section[];
  thanksMessage?: string;
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** Sentinel selected when "Other" is chosen; the typed text lives in `${id}_other`. */
export const OTHER_VALUE = '__other';
