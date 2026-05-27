import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { allSurveys } from '../surveys';

const BENEFITS = [
  { t: 'Shapes the product', d: 'Your answers directly guide what we build next.' },
  { t: 'Quick & simple', d: 'About 3–4 minutes, one step at a time.' },
  { t: 'Private & secure', d: 'Stored in our own system, used only to improve B2BCAB.' },
];

export function HomePage() {
  useEffect(() => {
    document.title = 'B2BCAB — Agent Survey';
  }, []);

  const surveys = allSurveys();
  const primary = surveys[0];
  const rest = surveys.slice(1);

  return (
    <Shell>
      {primary && (
        <section
          className="relative overflow-hidden rounded-3xl border border-line p-7 sm:p-10"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-50) 0%, #ffffff 58%)' }}
        >
          <svg
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48"
            style={{ opacity: 0.07 }}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <path d="M15 7 L25 7 L18 21 L9 21 Z" fill="var(--color-brand-600)" />
            <path d="M22 22 L31 22 L24 36 L15 36 Z" fill="var(--color-brand-600)" />
          </svg>

          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
            Agent Survey
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-[1.1] text-ink sm:text-[2.7rem]">
            Help us build the cab platform <span className="text-brand-600">you</span> actually want.
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft sm:text-base">
            {primary.intro}
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              to={`/s/${primary.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              Start the survey
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className="text-[13px] text-ink-mute">~3–4 minutes · your data stays private</span>
          </div>
        </section>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.t} className="rounded-2xl border border-line bg-paper-2 p-4">
            <div className="text-[14px] font-semibold text-ink">{b.t}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-ink-mute">{b.d}</div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-ink">More forms</h2>
          <div className="mt-3 space-y-3">
            {rest.map((s) => (
              <Link
                key={s.slug}
                to={`/s/${s.slug}`}
                className="block rounded-xl border border-line bg-paper-2 p-4 transition hover:border-brand-300"
              >
                <div className="font-semibold text-ink">{s.title}</div>
                {s.intro && <div className="mt-1 line-clamp-2 text-[14px] text-ink-mute">{s.intro}</div>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}
