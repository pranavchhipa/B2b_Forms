import type { ReactElement } from 'react';
import { OTHER_VALUE } from '../core/types';
import type { AnswerValue, Question as QuestionT } from '../core/types';

interface Props {
  question: QuestionT;
  value: AnswerValue | undefined;
  otherValue: string;
  error?: string;
  onChange: (value: AnswerValue) => void;
  onOtherChange: (value: string) => void;
}

const inputBase =
  'w-full rounded-xl border border-line bg-paper-2 px-4 py-3 text-[15px] text-ink ' +
  'placeholder:text-ink-mute/70 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-400/20';

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-[15px] font-medium transition active:scale-[0.98]',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-line bg-paper-2 text-ink-soft hover:border-brand-300 hover:bg-brand-50/50',
      ].join(' ')}
    >
      <span
        className={[
          'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
          selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-paper-2',
        ].join(' ')}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

export function Question({ question: q, value, otherValue, error, onChange, onOtherChange }: Props) {
  const text = typeof value === 'string' ? value : '';
  const selected = Array.isArray(value) ? value : [];

  const otherInput = (show: boolean) =>
    show && (
      <input
        autoFocus
        placeholder="Please specify"
        value={otherValue}
        onChange={(e) => onOtherChange(e.target.value)}
        className={inputBase + ' sm:col-span-2'}
      />
    );

  let control: ReactElement;
  switch (q.type) {
    case 'long-text':
      control = (
        <textarea
          id={q.id}
          rows={4}
          placeholder={q.placeholder}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase + ' resize-y leading-relaxed'}
        />
      );
      break;
    case 'number':
      control = (
        <input
          id={q.id}
          type="text"
          inputMode="numeric"
          placeholder={q.placeholder}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      );
      break;
    case 'phone':
      control = (
        <input
          id={q.id}
          type="tel"
          inputMode="tel"
          placeholder={q.placeholder}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      );
      break;
    case 'single-choice':
      control = (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options?.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={text === opt.value}
              onClick={() => onChange(opt.value)}
            />
          ))}
          {q.allowOther && (
            <Chip
              label="Other"
              selected={text === OTHER_VALUE}
              onClick={() => onChange(OTHER_VALUE)}
            />
          )}
          {otherInput(q.allowOther === true && text === OTHER_VALUE)}
        </div>
      );
      break;
    case 'multi-choice':
      control = (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options?.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={selected.includes(opt.value)}
              onClick={() =>
                onChange(
                  selected.includes(opt.value)
                    ? selected.filter((x) => x !== opt.value)
                    : [...selected, opt.value],
                )
              }
            />
          ))}
          {q.allowOther && (
            <Chip
              label="Other"
              selected={selected.includes(OTHER_VALUE)}
              onClick={() =>
                onChange(
                  selected.includes(OTHER_VALUE)
                    ? selected.filter((x) => x !== OTHER_VALUE)
                    : [...selected, OTHER_VALUE],
                )
              }
            />
          )}
          {otherInput(q.allowOther === true && selected.includes(OTHER_VALUE))}
        </div>
      );
      break;
    default:
      control = (
        <input
          id={q.id}
          type="text"
          placeholder={q.placeholder}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      );
  }

  return (
    <div>
      <label htmlFor={q.id} className="block text-[15px] font-semibold text-ink">
        {q.label}
        {q.required && <span className="ml-1 text-brand-600">*</span>}
      </label>
      {q.help && <p className="mt-1 text-[13px] text-ink-mute">{q.help}</p>}
      <div className="mt-3">{control}</div>
      {error && <p className="mt-2 text-[13px] font-medium text-clay">{error}</p>}
    </div>
  );
}
