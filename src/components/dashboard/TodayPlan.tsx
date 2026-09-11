import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Scissors,
  CalendarDays,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { StudySession } from '../../types/studyvault';

export const TodayPlan: React.FC = () => {
  const {
    sessions,
    toggleSessionComplete,
    splitSession,
    setSelectedSession,
  } = useStudyVault();

  // Filter today's sessions (Friday / current day)
  const todaySessions = sessions.filter((s) => s.dayOfWeek === 'FRI');

  const completedCount = todaySessions.filter((s) => s.status === 'completed').length;
  const totalCount = todaySessions.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <GlassCard variant="default" rounded="lg" className="p-5 sm:p-6">
      {/* Header with progress indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Today's plan
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
              Friday • Sep 11
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {completedCount} of {totalCount} sessions completed ({percentage}%)
          </p>
        </div>

        {/* Mini progress bar */}
        <div className="flex items-center gap-3 w-full sm:w-56">
          <div className="flex-1 bg-dark-900/80 rounded-full h-2 overflow-hidden border border-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 shrink-0">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="mt-5 space-y-3">
        {todaySessions.map((session) => {
          const isDone = session.status === 'completed';

          return (
            <div
              key={session.id}
              className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-card-sm border transition-all duration-200 ${
                isDone
                  ? 'bg-white/[0.02] border-white/[0.05] opacity-65'
                  : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-tactile'
              }`}
            >
              {/* Left: Checkbox + Time + Topic Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Completion Toggle */}
                <button
                  onClick={() => toggleSessionComplete(session.id)}
                  className="mt-0.5 sm:mt-0 p-1 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                  aria-label={isDone ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  )}
                </button>

                {/* Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        isDone
                          ? 'text-slate-500 bg-white/[0.02] border-white/[0.05]'
                          : 'text-slate-300 bg-white/[0.05] border-white/10'
                      }`}
                    >
                      {session.startTime} — {session.endTime}
                    </span>

                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${session.subjectColor}18`,
                        color: session.subjectColor,
                        border: `1px solid ${session.subjectColor}35`,
                      }}
                    >
                      {session.subjectName}
                    </span>

                    {session.isAdaptive && (
                      <Badge variant="adaptive" size="xs">
                        Adaptive
                      </Badge>
                    )}
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-semibold mt-1.5 transition-colors ${
                      isDone ? 'text-slate-400 line-through' : 'text-white group-hover:text-blue-200'
                    }`}
                  >
                    {session.topicName}
                  </h4>

                  {session.adaptiveReason && (
                    <p className="text-[11px] text-cyan-300/90 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                      {session.adaptiveReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Duration + Actions */}
              <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{session.durationMinutes} min</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isDone && (
                    <button
                      onClick={() => splitSession(session.id)}
                      title="Split into two 30m sessions"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedSession(session)}
                    title="View session details / reschedule"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
