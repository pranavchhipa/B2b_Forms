import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function BoltGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M15 7 L25 7 L18 21 L9 21 Z" fill="var(--color-brand-500)" />
      <path d="M22 22 L31 22 L24 36 L15 36 Z" fill="var(--color-brand-500)" />
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas flex min-h-svh flex-col">
      <header className="bg-ink text-paper">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <BoltGlyph />
            <span className="text-lg font-semibold tracking-tight">
              B2B<span className="text-brand-400">CAB</span>
            </span>
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
