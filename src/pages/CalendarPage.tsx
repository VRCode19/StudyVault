import React from 'react';
import { Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { StudyCalendar } from '../components/calendar/StudyCalendar';
import { SessionModal } from '../components/calendar/SessionModal';
import { GlassBadge } from '../components/common/GlassBadge';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Calendar
            </h1>
            <GlassBadge variant="cyan" size="sm">
              Self-Rebalancing
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic liquid schedule that arranges modules and tests into your peak focus rhythm.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Deadline Protected
          </span>
        </div>
      </div>

      {/* Main Glass Calendar View */}
      <StudyCalendar />

      {/* Modal for session interactions */}
      <SessionModal />
    </div>
  );
};
