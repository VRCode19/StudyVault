import React from 'react';
import { Calendar, Sparkles, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { StudyCalendar } from '../components/calendar/StudyCalendar';
import { SessionModal } from '../components/calendar/SessionModal';
import { Badge } from '../components/common/Badge';

export const SchedulePage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Adaptive Study Calendar
            </h1>
            <Badge variant="adaptive" size="sm">
              Self-Rebalancing
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic timetable that expands, shifts, and protects study blocks around your daily rhythm.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> End Semester Safe
          </span>
        </div>
      </div>

      {/* Main Calendar View */}
      <StudyCalendar />

      {/* Modal for session interactions */}
      <SessionModal />
    </div>
  );
};
