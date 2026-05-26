import { useState } from 'react';
import { OTHER_VALUE } from '../core/types';
import type { Question } from '../core/types';

const BAR_COLORS = ['#13a3f5', '#2f7d6b', '#c0532f', '#335c81', '#8a6d3b'];

function Empty() {
  return <p className="text-[13px] italic text-ink-mute">No responses yet.</p>;
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export function ChoiceChart({
  question,
  counts,
}: {
  question: Question;
  counts: Record<string, number>;
}) {
  const known = new Set((question.options ?? []).map((o) => o.value));
  const data = [
    ...(question.options ?? []).map((o) => ({ label: o.label, count: counts[o.value] ?? 0 })),
    ...Object.keys(counts)
      .filter((k) => !known.has(k))
      .map((k) => ({ label: k === OTHER_VALUE ? 'Other' : k, count: counts[k] })),
  ].sort((a, b) => b.count - a.count);

  if (!data.length) return <Empty />;
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-[13px] text-ink-soft sm:w-40" title={d.label}>
            {d.label}
          </div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-paper">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${(d.count / max) * 100}%`,
                backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
              }}
            />
          </div>
          <div className="w-6 shrink-0 text-right text-[13px] font-semibold text-ink">{d.count}</div>
        </div>
      ))}
    </div>
  );
}

export function NumberStats({
  agg,
}: {
  agg: { count: number; avg: number; median: number; min: number; max: number };
}) {
  if (!agg.count) return <Empty />;
  const tiles = [
    { k: 'Responses', v: fmt(agg.count) },
    { k: 'Average', v: fmt(agg.avg) },
    { k: 'Median', v: fmt(agg.median) },
    { k: 'Min', v: fmt(agg.min) },
    { k: 'Max', v: fmt(agg.max) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.k} className="rounded-lg border border-line bg-paper px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-ink-mute">{t.k}</div>
          <div className="mt-0.5 font-display text-lg text-ink">{t.v}</div>
        </div>
      ))}
    </div>
  );
}

export function TextResponses({ responses }: { responses: string[] }) {
  const [open, setOpen] = useState(false);
  if (!responses.length) return <Empty />;
  const shown = open ? responses : responses.slice(0, 3);
  return (
    <div>
      <ul className="space-y-2">
        {shown.map((r, i) => (
          <li
            key={i}
            className="rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink-soft"
          >
            “{r}”
          </li>
        ))}
      </ul>
      {responses.length > 3 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2.5 text-[13px] font-semibold text-brand-700 hover:underline"
        >
          {open ? 'Show less' : `Show all ${responses.length} responses`}
        </button>
      )}
    </div>
  );
}
