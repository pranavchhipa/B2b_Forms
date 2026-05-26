import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas flex min-h-svh flex-col">
      <header className="bg-ink text-paper">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center" aria-label="B2BCAB home">
            <img src="/logo.webp" alt="B2BCAB" className="h-7 w-auto" />
          </Link>
          <span className="text-[11px] uppercase tracking-[0.2em] text-paper/55">Vendor Survey</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 sm:py-8">{children}</main>

      <footer className="mx-auto w-full max-w-2xl px-5 py-6 text-center text-xs text-ink-mute">
        Your answers are stored securely and used only to improve B2BCAB.
      </footer>
    </div>
  );
}
