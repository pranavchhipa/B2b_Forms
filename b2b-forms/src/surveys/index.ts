import type { SurveyConfig } from '../core/types';
import { b2bcabVendorSurvey } from './b2bcab-vendor';

/** Registry of all surveys, keyed by slug. Add a new form here. */
export const surveys: Record<string, SurveyConfig> = {
  [b2bcabVendorSurvey.slug]: b2bcabVendorSurvey,
};

export function getSurvey(slug: string | undefined): SurveyConfig | undefined {
  return slug ? surveys[slug] : undefined;
}

export const allSurveys = (): SurveyConfig[] => Object.values(surveys);
