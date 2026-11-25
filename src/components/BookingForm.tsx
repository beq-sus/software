import { Clock, ArrowRight, AlertTriangle, CalendarClock, Timer } from 'lucide-react';
import { formatDuration, minutesToTime, timeToMinutes } from '@/utils/time';

interface BookingFormProps {
  startTime: string;
  duration: string;
  currentTime: string;
  onStartTimeChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onCurrentTimeChange: (value: string) => void;
  onCheck: () => void;
  onReset: () => void;
  durationWarning: boolean;
  inputError?: string | null;
}

function TimeField({
  id,
  label,
  value,
  onChange,
  icon,
  hint,
  type = 'time',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  hint?: string;
  type?: 'time' | 'number';
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...(type === 'number' ? { inputMode: 'numeric' as const, min: 1, max: 120, step: 5 } : {})}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-lg font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all bg-white"
      />
      {hint && <p className="mt-1.5 text-[13px] text-slate-600">{hint}</p>}
    </div>
  );
}

export function BookingForm({
  startTime,
  duration,
  currentTime,
  onStartTimeChange,
  onDurationChange,
  onCurrentTimeChange,
  onCheck,
  onReset,
  durationWarning,
  inputError = null,
}: BookingFormProps) {
  const startMin = timeToMinutes(startTime);
  // Display only: the end time shown here is not used for the decision (contract.ts decides).
  const durationMin = /^\d{1,4}$/.test(duration.trim()) ? Number(duration) : 0;
  const endLabel = startMin !== null && durationMin > 0 ? minutesToTime(startMin + durationMin) : '--:--';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
        <CalendarClock className="w-5 h-5 text-brand-600" />
        Check a Time Slot
      </h2>
      <p className="text-[13px] text-slate-600 mb-5">
        Pick a start time and a duration (1–120 minutes) to see if the room is available.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <TimeField
          id="now"
          label="Current time"
          value={currentTime}
          onChange={onCurrentTimeChange}
          icon={<Clock className="w-4 h-4" />}
          hint="Simulated 'now' — the start must be after this."
        />
        <div className="hidden sm:block" />
        <TimeField
          id="start"
          label="Start time"
          value={startTime}
          onChange={onStartTimeChange}
          icon={<Clock className="w-4 h-4" />}
        />
        <TimeField
          id="duration"
          type="number"
          label="Duration (minutes)"
          value={duration}
          onChange={onDurationChange}
          icon={<Timer className="w-4 h-4" />}
          hint="1–120 minutes."
        />
      </div>

      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">{startTime || '--:--'}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium">{endLabel}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            durationWarning
              ? 'bg-warning-50 text-warning-700'
              : durationMin > 0
                ? 'bg-slate-100 text-slate-600'
                : 'text-slate-500'
          }`}
        >
          {durationWarning && <AlertTriangle className="w-4 h-4" />}
          {formatDuration(durationMin)}
        </div>
      </div>

      {inputError && (
        <p
          role="alert"
          className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-danger-50 border border-danger-200 text-sm font-medium text-danger-700"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {inputError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCheck}
          className="flex-1 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 active:scale-[0.98] transition-all shadow-lg shadow-brand-600/20"
        >
          Check Availability
        </button>
        <button
          onClick={onReset}
          className="px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
