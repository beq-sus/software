import { MapPin, Users, Building2, Lock, CheckCircle2 } from 'lucide-react';
import type { Room } from '@/types';

interface HeaderProps {
  room: Room;
  onToggleBlock: () => void;
}

export function Header({ room, onToggleBlock }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-brand-600 uppercase tracking-wider mb-0.5">
                <span>Smart Campus</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">Room Availability</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {room.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[13px] text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {room.building}, {room.floor}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {room.capacity} seats
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleBlock}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 self-start sm:self-center ${
              room.blocked
                ? 'bg-danger-50 border-danger-200 text-danger-700 hover:bg-danger-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {room.blocked ? (
              <>
                <Lock className="w-4 h-4" />
                Blocked
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Open
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
