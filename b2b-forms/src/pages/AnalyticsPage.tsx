import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Shell } from '../components/Shell';
import { NotFound } from '../components/NotFound';
import { ChoiceChart, NumberStats, TextResponses } from '../components/charts';
import { getSurvey } from '../surveys';
import { fetchAggregates, exportCsvUrl } from '../core/analytics';
import type { AggregateResult } from '../core/analytics';
import { fieldSpec } from '../core/schema';
import type { SurveyConfig } from '../core/types';

export function AnalyticsPage() {
  const { slug } = useParams();
  const config = getSurvey(slug);
  if (!config) return <NotFound />;
  return <Dashboard config={config} />;
}

function Dashboard({ config }: { config: SurveyConfig }) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AggregateResult | null>(null);

  useEffect(() => {
    document.title = `${config.title} · Results`;
  }, [config.title]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAggregates(config.formId, passcode, fieldSpec(config));
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <Shell>
        <div className="mx-auto mt-8 max-w-sm">
          <h1 className="font-display text-2xl text-ink">{config.title}</h1>
          <p className="mt-1 text-[14px] text-ink-mute">
            Results dashboard — enter the passcode to view.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode"
              autoFocus
              className="w-full rounded-xl border border-line bg-paper-2 px-4 py-3 text-[15px] text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-400/20"
            />
            {error && <p className="text-[13px] font-medium text-clay">{error}</p>}
            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full rounded-xl bg-brand-600 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? 'Checking…' : 'View results'}
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  const shareUrl = `${window.location.origin}/s/${config.slug}`;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">{config.title}</h1>
          <p className="mt-1 text-[14px] text-ink-mute">
            {data.total} response{data.total === 1 ? '' : 's'}
            {data.lastResponse && ` · last ${new Date(data.lastResponse).toLocaleString('en-IN')}`}
          </p>
        </div>
        <a
          href={exportCsvUrl(config.formId, passcode)}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-line bg-paper-2 px-4 py-2.5 text-[14px] font-semibold text-ink-soft transition hover:border-ink/25"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="rounded-lg bg-white p-2">
          <QRCodeSVG value={shareUrl} size={92} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink">Share this form</div>
          <div className="mt-1 truncate text-[13px] text-ink-mute">{shareUrl}</div>
          <CopyButton text={shareUrl} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {config.sections.map((section) => {
          const visible = section.questions.filter((q) => {
            const agg = data.questions[q.id];
            return agg && agg.type !== 'skip';
          });
          if (!visible.length) return null;
          return (
            <div key={section.id}>
              <h2 className="mb-2 font-display text-lg text-ink-soft">{section.title}</h2>
              <div className="space-y-3">
                {visible.map((q) => {
                  const agg = data.questions[q.id];
                  if (!agg) return null;
                  return (
                    <div key={q.id} className="rounded-xl border border-line bg-paper-2 p-4">
                      <div className="text-[14px] font-semibold text-ink">{q.label}</div>
                      <div className="mt-3">
                        {agg.type === 'choice' && <ChoiceChart question={q} counts={agg.counts} />}
                        {agg.type === 'number' && <NumberStats agg={agg} />}
                        {agg.type === 'text' && <TextResponses responses={agg.responses} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="mt-2 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper transition hover:bg-ink-soft"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}
