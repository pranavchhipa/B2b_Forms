import type { AnswerValue, Answers, Section as SectionT } from '../core/types';
import { Question } from './Question';

interface Props {
  section: SectionT;
  answers: Answers;
  errors: Record<string, string>;
  setAnswer: (id: string, value: AnswerValue) => void;
}

export function Section({ section, answers, errors, setAnswer }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">{section.title}</h2>
      {section.description && (
        <p className="mt-1.5 text-[15px] text-ink-mute">{section.description}</p>
      )}

      <div className="mt-6 space-y-7">
        {section.questions.map((q, i) => {
          const otherRaw = answers[`${q.id}_other`];
          return (
            <div key={q.id} className="animate-rise" style={{ animationDelay: `${i * 55}ms` }}>
              <Question
                question={q}
                value={answers[q.id]}
                otherValue={typeof otherRaw === 'string' ? otherRaw : ''}
                error={errors[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                onOtherChange={(v) => setAnswer(`${q.id}_other`, v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
