import { CalendarDays } from 'lucide-react';
import type { Booking } from '@/types';
import { minutesToLabel } from '@/utils/time';

interface TimelineProps {
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
  currentTime: number | null;
}

const DAY_START = 7 * 60;  // 07:00
const DAY_END = 21 * 60;   // 21:00
const RANGE = DAY_END - DAY_START;

function position(min: number): number {
  return ((min - DAY_START) / RANGE) * 100;
}

const BOOKING_COLORS = [
  'bg-brand-500',
  'bg-accent-500',
  'bg-success-500',
];

export function Timeline({ bookings, candidateStart, candidateEnd, currentTime }: TimelineProps) {
  const hours: number[] = [];
  for (let h = 7; h <= 21; h++) hours.push(h);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
        <CalendarDays className="w-5 h-5 text-brand-600" />
        Today's Schedule
      </h2>
      <p className="text-[13px] text-slate-600 mb-5">
        Existing bookings and your proposed time slot.
      </p>

      <div className="relative h-28 sm:h-36 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
        {/* Hour grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200/70"
            style={{ left: `${position(h * 60)}%` }}
          >
            <span className={`absolute bottom-1 text-xs text-slate-500 -translate-x-1/2 font-medium ${h % 2 === 1 ? 'hidden sm:inline' : ''}`}>
              {h}:00
            </span>
          </div>
        ))}

        {/* Existing bookings */}
        {bookings.map((b, i) => {
          const left = position(Math.max(b.start, DAY_START));
          const right = position(Math.min(b.end, DAY_END));
          const width = right - left;
          if (width <= 0) return null;
          return (
            <div
              key={b.id}
              className={`absolute top-3 bottom-7 rounded-lg ${BOOKING_COLORS[i % BOOKING_COLORS.length]} opacity-85 flex items-center justify-center overflow-hidden group transition-all hover:opacity-100 cursor-default`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.title} — ${minutesToLabel(b.start)} to ${minutesToLabel(b.end)}`}
            >
              <span className="text-xs sm:text-sm font-semibold text-white px-2 truncate">
                {b.title}
              </span>
            </div>
          );
        })}

        {/* Current time marker */}
        {currentTime !== null && currentTime >= DAY_START && currentTime <= DAY_END && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-20"
            style={{ left: `${position(currentTime)}%` }}
          >
            <div className="absolute -top-0 -left-1 w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="absolute -top-5 -translate-x-1/2 text-xs font-semibold text-slate-600 whitespace-nowrap">
              Now
            </span>
          </div>
        )}

        {/* Candidate interval */}
        {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
          <div
            className="absolute top-3 bottom-7 rounded-lg border-[3px] border-dashed border-brand-500 bg-brand-200/70 z-10 flex items-center justify-center animate-fade-in shadow-md shadow-brand-500/25"
            style={{
              left: `${position(Math.max(candidateStart, DAY_START))}%`,
              width: `${position(Math.min(candidateEnd, DAY_END)) - position(Math.max(candidateStart, DAY_START))}%`,
            }}
          >
            <span className="text-xs sm:text-sm font-bold text-brand-800 truncate px-2">
              Your slot
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-5 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-brand-500" /> Existing booking
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-brand-500 bg-brand-200/70" /> Your proposed slot
        </span>
        <span className="flex items-center gap-2">
          <span className="w-0.5 h-3.5 bg-slate-500" /> Current time
        </span>
      </div>
    </div>
  );
}
