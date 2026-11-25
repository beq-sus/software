import { FlaskConical, Play } from 'lucide-react';
import { useState } from 'react';
import type { TestCase } from '@/types';
import type { AvailabilityReason } from '@/types';

interface TestCasesProps {
  cases: TestCase[];
  onRun: (tc: TestCase) => void;
  lastResultReason: AvailabilityReason | null;
  lastTestCaseId: string | null;
}

export function TestCases({ cases, onRun, lastResultReason, lastTestCaseId }: TestCasesProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-slate-50/60 transition-colors"
      >
        <span className="flex items-center gap-2 text-base font-bold text-slate-900">
          <FlaskConical className="w-5 h-5 text-accent-500" />
          Test Cases
          <span className="text-[13px] font-normal text-slate-500 ml-1">
            (verify each acceptance criterion)
          </span>
        </span>
        <span className="text-sm text-slate-500">
          {expanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-5 space-y-2.5 animate-slide-up">
          {cases.map((tc) => {
            const wasRun = lastTestCaseId === tc.id;
            const passed = wasRun && lastResultReason === tc.expectedReason;

            return (
              <div
                key={tc.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  wasRun
                    ? passed
                      ? 'border-success-200 bg-success-50/60'
                      : 'border-danger-200 bg-danger-50/60'
                    : 'border-slate-100 bg-slate-50/40 hover:border-slate-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-800">{tc.label}</span>
                    <span className="text-[13px] text-slate-500">
                      {tc.start} → {tc.end}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-600 mt-0.5">{tc.description}</p>
                </div>

                <button
                  onClick={() => onRun(tc)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
