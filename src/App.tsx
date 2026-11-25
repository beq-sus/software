import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BookingForm } from '@/components/BookingForm';
import { Timeline } from '@/components/Timeline';
import { ResultBanner } from '@/components/ResultBanner';
import { ContractTests } from '@/components/ContractTests';
import { ROOM } from '@/data';
import { MAX_DURATION_MINUTES } from '@/utils/availability';
import { timeToMinutes } from '@/utils/time';
import { DEFAULT_SLOT } from '@/utils/slot';
import { checkRequest, type ReasonCode } from '@/utils/contract';
import type { AvailabilityResult } from '@/types';

const DEFAULT_DURATION = '60';

function App() {
  const [room, setRoom] = useState(ROOM);
  const [startTime, setStartTime] = useState<string>(DEFAULT_SLOT.start);
  const [duration, setDuration] = useState<string>(DEFAULT_DURATION);
  const [currentTime, setCurrentTime] = useState<string>(DEFAULT_SLOT.currentTime);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [checkedStart, setCheckedStart] = useState<number>(0);
  const [checkedEnd, setCheckedEnd] = useState<number>(0);
  const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const startMin = timeToMinutes(startTime);
  const currentMin = timeToMinutes(currentTime);
  const durationMin = /^\d{1,4}$/.test(duration.trim()) ? Number(duration) : 0;
  const endMin = startMin !== null && durationMin > 0 ? startMin + durationMin : null;
  const durationWarning = durationMin > MAX_DURATION_MINUTES;

  // Practice #12: one path for the form — validation + rule engine live in contract.ts.
  const handleCheck = useCallback(() => {
    const response = checkRequest(room, {
      start: startTime,
      duration,
      blocked: room.blocked,
      now: currentTime,
      bookings: room.bookings,
    });
    setReasonCode(response.reasonCode);
    if (response.validationError || !response.result) {
      // Never leave an old verdict on screen for input that was not checked.
      setResult(null);
      setInputError(`${response.message} (${response.reasonCode})`);
      return;
    }
    setInputError(null);
    setResult({ ...response.result, message: response.message });
    setCheckedStart(response.start ?? 0);
    setCheckedEnd(response.end ?? 0);
  }, [room, startTime, duration, currentTime]);

  const handleReset = useCallback(() => {
    setStartTime(DEFAULT_SLOT.start);
    setDuration(DEFAULT_DURATION);
    setCurrentTime(DEFAULT_SLOT.currentTime);
    setResult(null);
    setReasonCode(null);
    setInputError(null);
  }, []);

  const handleToggleBlock = useCallback(() => {
    setRoom((prev) => ({
      ...prev,
      blocked: !prev.blocked,
      blockReason: !prev.blocked ? 'Room is under maintenance.' : undefined,
    }));
    setResult(null);
    setReasonCode(null);
    setInputError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header room={room} onToggleBlock={handleToggleBlock} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6">
          {/* Left column — form + result */}
          <div className="lg:col-span-3 space-y-5 order-2 lg:order-1">
            <BookingForm
              startTime={startTime}
              duration={duration}
              currentTime={currentTime}
              onStartTimeChange={setStartTime}
              onDurationChange={setDuration}
              onCurrentTimeChange={setCurrentTime}
              onCheck={handleCheck}
              onReset={handleReset}
              durationWarning={durationWarning}
              inputError={inputError}
            />

            {result && (
              <ResultBanner
                result={result}
                candidateStart={checkedStart}
                candidateEnd={checkedEnd}
                room={room}
                reasonCode={reasonCode}
              />
            )}
          </div>

          {/* Right column — timeline + test cases */}
          <div className="lg:col-span-2 space-y-5 order-1 lg:order-2">
            <Timeline
              bookings={room.bookings}
              candidateStart={result ? checkedStart : (startMin ?? null)}
              candidateEnd={result ? checkedEnd : (endMin ?? null)}
              currentTime={currentMin}
            />

            <ContractTests fixture={ROOM} />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          Prototype only — checks availability, does not save or confirm bookings. All data is fictional.
        </footer>
      </main>
    </div>
  );
}

export default App;
