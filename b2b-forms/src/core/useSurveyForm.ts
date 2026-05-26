import { useCallback, useEffect, useState } from 'react';
import type { AnswerValue, Answers, SurveyConfig } from './types';
import { validateSection } from './validation';

const draftKey = (slug: string) => `survey-draft:${slug}`;

function loadDraft(slug: string): Answers {
  try {
    const raw = localStorage.getItem(draftKey(slug));
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

export function useSurveyForm(config: SurveyConfig) {
  const [answers, setAnswers] = useState<Answers>(() => loadDraft(config.slug));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      localStorage.setItem(draftKey(config.slug), JSON.stringify(answers));
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }, [answers, config.slug]);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const sections = config.sections;
  const totalSteps = sections.length;
  const currentSection = sections[step];
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const validateCurrent = useCallback(() => {
    const e = validateSection(currentSection, answers);
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [currentSection, answers]);

  const next = useCallback(() => {
    const e = validateSection(currentSection, answers);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
      window.scrollTo({ top: 0 });
    }
  }, [currentSection, answers, totalSteps]);

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey(config.slug));
    } catch {
      // ignore
    }
  }, [config.slug]);

  return {
    answers,
    setAnswer,
    step,
    totalSteps,
    currentSection,
    isFirst,
    isLast,
    errors,
    next,
    back,
    validateCurrent,
    clearDraft,
  };
}
