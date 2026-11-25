import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { AvailabilityResult, Room } from '@/types';
import type { ReasonCode } from '@/utils/contract';
import { minutesToLabel, slotDurationLabel } from '@/utils/time';
import { Explanation } from '@/components/Explanation';
import { explanationKey } from '@/utils/explain';

interface ResultBannerProps {
  result: AvailabilityResult;
  candidateStart: number;
  candidateEnd: number;
  room: Room;
  reasonCode?: ReasonCode | null;
}

export function ResultBanner({ result, candidateStart, candidateEnd, room, reasonCode = null }: ResultBannerProps) {
  const isAvailable = result.available;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border-2 p-5 sm:p-6 animate-scale-in ${
        isAvailable
          ? 'bg-success-50 border-success-200'
          : 'bg-danger-50 border-danger-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isAvailable ? 'bg-success-500' : 'bg-danger-500'
          }`}
        >
          {isAvailable ? (
            <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
          ) : (
            <XCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-2xl font-extrabold leading-tight ${
              isAvailable ? 'text-success-700' : 'text-danger-700'
            }`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </h3>
          <p
            className={`text-sm mt-0.5 ${
              isAvailable ? 'text-success-700' : 'text-danger-700'
            }`}
          >
            {result.message}
          </p>

          {/* Details row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
            <span className="text-slate-600">
              Slot:{' '}
              <span className="font-semibold text-slate-900">
                {minutesToLabel(candidateStart)} – {minutesToLabel(candidateEnd)}
              </span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Duration:{' '}
              <span className="font-semibold text-slate-900">
                {slotDurationLabel(candidateStart, candidateEnd)}
              </span>
            </span>

            {reasonCode && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Reason code: <code className="font-semibold text-slate-900">{reasonCode}</code>
                </span>
              </>
            )}

            {result.conflictingBooking && (
              <>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Info className="w-3.5 h-3.5" />
                  Conflicts with:{' '}
                  <span className="font-semibold text-slate-900">
                    {result.conflictingBooking.title}
                  </span>
                  <span className="text-slate-500">
                    ({minutesToLabel(result.conflictingBooking.start)}–{minutesToLabel(result.conflictingBooking.end)})
                  </span>
                </span>
              </>
            )}
          </div>

          <Explanation
            key={explanationKey(result, candidateStart, candidateEnd)}
            result={result} room={room} start={candidateStart} end={candidateEnd} />
        </div>
      </div>
    </div>
  );
}
