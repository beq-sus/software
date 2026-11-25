import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import type { AvailabilityResult, Room } from '@/types';
import { explainAvailability } from '@/utils/explain';

interface ExplanationProps {
  result: AvailabilityResult;
  room: Room;
  start: number;
  end: number;
}

type ExplanationState = 'idle' | 'loading' | 'done';

export function Explanation({ result, room, start, end }: ExplanationProps) {
  const [state, setState] = useState<ExplanationState>('idle');
  const [text, setText] = useState<string | null>(null);

  const handleExplain = async () => {
    setState('loading');
    const outcome = await explainAvailability({ result, room, start, end });
    setText(outcome.explanation);
    setState('done');
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/80">
      {state === 'idle' && (
        <button
          type="button"
          onClick={handleExplain}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
        >
          <Lightbulb className="w-4 h-4" />
          Explain this result
        </button>
      )}

      {state === 'loading' && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Preparing explanation…
        </p>
      )}

      {state === 'done' && text && (
        <div aria-live="polite">
          <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
            <Lightbulb className="w-4 h-4" />
            Why
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}
