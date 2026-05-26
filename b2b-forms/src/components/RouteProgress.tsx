export function RouteProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="relative px-1 py-1">
      <div className="road-dash absolute left-3 right-3 top-1/2 h-[2px] -translate-y-1/2" />
      <div className="relative flex items-center justify-between">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <span
              key={i}
              className={[
                'grid place-items-center rounded-full bg-paper transition-all duration-300',
                active ? 'h-6 w-6 ring-4 ring-brand-400/30' : 'h-4 w-4',
              ].join(' ')}
            >
              {done ? (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-ink">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : active ? (
                <span className="h-3.5 w-3.5 rounded-full bg-brand-500" />
              ) : (
                <span className="h-4 w-4 rounded-full border-2 border-line bg-paper-2" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
