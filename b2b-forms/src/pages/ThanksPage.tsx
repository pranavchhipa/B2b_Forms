import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { getSurvey } from '../surveys';

export function ThanksPage() {
  const { slug } = useParams();
  const config = getSurvey(slug);

  useEffect(() => {
    document.title = 'Thank you';
  }, []);

  return (
    <Shell>
      <div className="mx-auto mt-8 max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink">Thank you!</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {config?.thanksMessage ?? 'Your response has been recorded.'}
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl border border-line bg-paper-2 px-5 py-3 text-[15px] font-semibold text-ink-soft transition hover:border-ink/25"
        >
          Back to start
        </Link>
      </div>
    </Shell>
  );
}
