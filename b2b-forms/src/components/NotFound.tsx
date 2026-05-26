import { Link } from 'react-router-dom';
import { Shell } from './Shell';

export function NotFound() {
  return (
    <Shell>
      <div className="mx-auto mt-10 max-w-sm text-center">
        <h1 className="font-display text-3xl text-ink">Not found</h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This form doesn’t exist, or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition hover:bg-ink-soft"
        >
          Back to start
        </Link>
      </div>
    </Shell>
  );
}
