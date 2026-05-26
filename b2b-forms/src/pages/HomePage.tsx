import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { allSurveys } from '../surveys';

export function HomePage() {
  useEffect(() => {
    document.title = 'B2BCab — Forms';
  }, []);

  const surveys = allSurveys();

  return (
    <Shell>
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="font-display text-3xl text-ink">Forms</h1>
        <p className="mt-2 text-[15px] text-ink-mute">
          Open a form from its direct link, or pick one below.
        </p>
        <div className="mt-6 space-y-3">
          {surveys.map((s) => (
            <Link
              key={s.slug}
              to={`/s/${s.slug}`}
              className="block rounded-xl border border-line bg-paper-2 p-4 transition hover:border-ink/25"
            >
              <div className="font-display text-lg text-ink">{s.title}</div>
              {s.intro && <div className="mt-1 line-clamp-2 text-[14px] text-ink-mute">{s.intro}</div>}
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
