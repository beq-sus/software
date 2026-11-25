import { useState } from 'react';
import { ClipboardCheck, Play } from 'lucide-react';
import type { Room } from '@/types';
import { CONTRACT_CASES } from '@/contractCases';
import { checkRequest, type CheckResponse } from '@/utils/contract';

interface Row {
  id: string;
  input: string;
  expected: string;
  observed: string;
  pass: boolean;
}

function describeResponse(r: CheckResponse): string {
  if (r.validationError) return `Validation error · ${r.reasonCode}`;
  return `${r.available ? 'Available' : 'Unavailable'} · ${r.reasonCode}`;
}

/** Runs the shared Practice #12 test set (T1–T8) against the fixture room. Read-only. */
export function ContractTests({ fixture }: { fixture: Room }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  const runAll = () => {
    const snapshot = JSON.stringify(fixture.bookings);
    const out: Row[] = CONTRACT_CASES.map((tc) => {
      const r = checkRequest(fixture, {
        start: tc.start,
        duration: tc.duration,
        blocked: tc.blocked,
        now: tc.now,
        bookings: fixture.bookings,
      });
      const expected = tc.validation
        ? `Validation error · ${tc.expectedCode}`
        : `${tc.expectedAvailable ? 'Available' : 'Unavailable'} · ${tc.expectedCode}`;
      return {
        id: tc.id,
        input: `${tc.start}, ${tc.duration} min${tc.blocked ? ', blocked' : ''}`,
        expected,
        observed: describeResponse(r),
        pass:
          r.available === tc.expectedAvailable &&
          r.reasonCode === tc.expectedCode &&
          r.validationError === tc.validation,
      };
    });
    const unchanged = JSON.stringify(fixture.bookings) === snapshot;
    out.push({
      id: 'T8',
      input: 'bookings after T1–T7',
      expected: 'Unchanged (3 bookings)',
      observed: unchanged ? `Unchanged (${fixture.bookings.length} bookings)` : 'CHANGED',
      pass: unchanged,
    });
    setRows(out);
  };

  const passed = rows?.filter((r) => r.pass).length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <ClipboardCheck className="w-5 h-5 text-accent-500" />
          Acceptance tests T1–T8
        </h2>
        <button
          onClick={runAll}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          Run all
        </button>
      </div>
      <p className="text-[13px] text-slate-600 mb-4">
        Same inputs as the low-code version. Current time 08:00, fixture bookings.
      </p>

      {rows && (
        <>
          <p
            aria-live="polite"
            className={`mb-3 text-sm font-bold ${passed === rows.length ? 'text-success-700' : 'text-danger-700'}`}
          >
            {passed} / {rows.length} passed
          </p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 px-1 font-semibold">ID</th>
                  <th className="py-1.5 px-1 font-semibold">Input</th>
                  <th className="py-1.5 px-1 font-semibold">Expected</th>
                  <th className="py-1.5 px-1 font-semibold">Observed</th>
                  <th className="py-1.5 px-1 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="py-1.5 px-1 font-semibold text-slate-800">{r.id}</td>
                    <td className="py-1.5 px-1 text-slate-600 whitespace-nowrap">{r.input}</td>
                    <td className="py-1.5 px-1 text-slate-600">{r.expected}</td>
                    <td className="py-1.5 px-1 text-slate-800">{r.observed}</td>
                    <td className={`py-1.5 px-1 font-bold ${r.pass ? 'text-success-700' : 'text-danger-700'}`}>
                      {r.pass ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
