import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Section } from '../components/Section';
import { RouteProgress } from '../components/RouteProgress';
import { NotFound } from '../components/NotFound';
import { getSurvey } from '../surveys';
import { useSurveyForm } from '../core/useSurveyForm';
import { surveyColumns } from '../core/schema';
import { submitResponse } from '../core/submit';
import { isBackendConfigured } from '../config';
import type { SurveyConfig } from '../core/types';

export function SurveyPage() {
  const { slug } = useParams();
  const config = getSurvey(slug);
  if (!config) return <NotFound />;
  return <SurveyRunner config={config} />;
}

function SurveyRunner({ config }: { config: SurveyConfig }) {
  const navigate = useNavigate();
  const form = useSurveyForm(config);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    document.title = config.title;
  }, [config.title]);

  const handleSubmit = async () => {
    if (!form.validateCurrent()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitResponse(config.formId, form.answers, surveyColumns(config));
      form.clearDraft();
      navigate(`/s/${config.slug}/thanks`);
    } catch {
      setSubmitError('Could not submit. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="mb-5 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink">
          Stop {form.step + 1} of {form.totalSteps}
        </span>
        <span className="text-ink-mute">{form.currentSection.title}</span>
      </div>

      <RouteProgress total={form.totalSteps} current={form.step} />

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_36px_-22px_rgba(22,23,28,0.3)] sm:p-7">
        {form.step === 0 && config.intro && (
          <p className="mb-6 border-l-2 border-brand-400 pl-4 text-[15px] leading-relaxed text-ink-soft">
            {config.intro}
          </p>
        )}
        <Section
          section={form.currentSection}
          answers={form.answers}
          errors={form.errors}
          setAnswer={form.setAnswer}
        />
      </div>

      {!isBackendConfigured && (
        <p className="mt-4 rounded-lg border border-brand-500/40 bg-brand-300/20 px-3.5 py-2.5 text-[13px] text-ink-soft">
          Heads up: the backend isn’t configured yet (set <code>VITE_APPS_SCRIPT_URL</code> — see
          docs/SETUP.md). Responses won’t be saved until then.
        </p>
      )}
      {submitError && (
        <p className="mt-4 rounded-lg border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-[13px] text-clay">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {!form.isFirst ? (
          <button
            type="button"
            onClick={form.back}
            className="rounded-xl border border-line bg-paper-2 px-5 py-3 text-[15px] font-semibold text-ink-soft transition hover:border-ink/25"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {!form.isLast ? (
          <button
            type="button"
            onClick={form.next}
            className="rounded-xl bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition hover:bg-ink-soft active:scale-[0.98]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-brand-500 px-6 py-3 text-[15px] font-semibold text-ink shadow-[0_2px_0_0_var(--color-brand-700)] transition hover:bg-brand-400 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>
    </Shell>
  );
}
