import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DayOfWeek, StudySession } from '../../types/studyvault';

export const StudyCalendar: React.FC = () => {
  const { sessions, subjects, setSelectedSession, simulateMissedSession } = useStudyVault();

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayDates: Record<DayOfWeek, string> = {
    MON: 'Sep 7',
    TUE: 'Sep 8',
    WED: 'Sep 9',
    THU: 'Sep 10',
    FRI: 'Sep 11 (Today)',
    SAT: 'Sep 12',
    SUN: 'Sep 13',
  };

  // Filter sessions by subject
  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectId === 'all') return true;
    return s.subjectId === selectedSubjectId;
  });

  return (
    <div className="space-y-6">
      {/* Calendar controls & filters */}
      <GlassCard variant="default" rounded="lg" className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View toggle & Month header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-dark-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white shadow-tactile'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white shadow-tactile'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Month
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
              <span className="font-mono">September 2026</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Week 37
              </span>
            </div>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubjectId === 'all'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              All Subjects
            </button>

            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'text-white border-white/30'
                      : 'text-slate-400 hover:text-slate-200 border-white/[0.05]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${sub.accentColor}30` : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.accentColor }}
                  />
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="glass"
              onClick={simulateMissedSession}
              icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            >
              <span className="hidden sm:inline">Auto-Rebalance</span>
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Week Grid View */}
      {viewMode === 'week' ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[850px] grid grid-cols-7 gap-3">
            {days.map((day) => {
              const daySessions = filteredSessions.filter((s) => s.dayOfWeek === day);
              const isToday = day === 'FRI';

              return (
                <div
                  key={day}
                  className={`flex flex-col min-h-[520px] rounded-card p-3 border transition-colors ${
                    isToday
                      ? 'bg-blue-600/[0.04] border-blue-500/30 shadow-blue-glow/10'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="pb-3 mb-3 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div
                        className={`text-xs font-bold font-mono tracking-wider ${
                          isToday ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="text-[11px] text-slate-500">{dayDates[day]}</div>
                    </div>

                    {daySessions.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[10px] font-mono text-slate-300 flex items-center justify-center">
                        {daySessions.length}
                      </span>
                    )}
                  </div>

                  {/* Sessions in Day */}
                  <div className="space-y-2.5 flex-1">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-3 text-center">
                        <span className="text-[11px] text-slate-600 font-mono">
                          Buffer Day
                        </span>
                      </div>
                    ) : (
                      daySessions.map((session) => {
                        const isDone = session.status === 'completed';
                        const isMissed = session.status === 'missed';

                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left group relative ${
                              isDone
                                ? 'bg-white/[0.02] border-white/[0.05] opacity-65'
                                : isMissed
                                ? 'bg-rose-500/10 border-rose-500/30'
                                : 'bg-dark-850/90 hover:bg-dark-800 border-white/10 hover:border-white/20 shadow-tactile hover:-translate-y-0.5'
                            }`}
                          >
                            {/* Subject Color Line */}
                            <div
                              className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                              style={{ backgroundColor: session.subjectColor }}
                            />

                            <div className="pl-1.5 space-y-1.5">
                              {/* Subject tag & Time */}
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wider truncate"
                                  style={{ color: session.subjectColor }}
                                >
                                  {session.subjectName}
                                </span>

                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : session.isAdaptive ? (
                                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                                ) : null}
                              </div>

                              {/* Topic Name */}
                              <h5
                                className={`text-xs font-semibold leading-snug ${
                                  isDone
                                    ? 'text-slate-400 line-through'
                                    : 'text-white group-hover:text-blue-200'
                                }`}
                              >
                                {session.topicName}
                              </h5>

                              {/* Time & Duration */}
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/[0.05]">
                                <span>{session.startTime}</span>
                                <span>{session.durationMinutes}m</span>
                              </div>

                              {session.isAdaptive && (
                                <div className="text-[9px] font-mono text-cyan-300/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 truncate">
                                  ⚡ Adapted
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Month Grid View */
        <GlassCard variant="default" rounded="lg" className="p-6">
          <div className="text-center py-10 space-y-3">
            <CalendarIcon className="w-10 h-10 text-blue-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">Monthly Overview — September 2026</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Total monthly plan: 36 topics distributed over 4 weeks. End Semester Examination arrives on September 29.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 text-left">
              <div className="p-3 rounded-xl bg-dark-900 border border-white/5">
                <div className="text-xs text-slate-400">Week 1</div>
                <div className="text-sm font-bold text-emerald-400">100% Completed</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-900 border border-white/5">
                <div className="text-xs text-slate-400">Week 2</div>
                <div className="text-sm font-bold text-emerald-400">92% Completed</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-900 border border-blue-500/30">
                <div className="text-xs text-blue-300">Week 3 (Current)</div>
                <div className="text-sm font-bold text-white">68% in progress</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-900 border border-white/5">
                <div className="text-xs text-slate-400">Week 4 (Exam Prep)</div>
                <div className="text-sm font-bold text-cyan-300">Revision Buffer</div>
              </div>
            </div>
            <div className="pt-4">
              <Button size="sm" variant="primary" onClick={() => setViewMode('week')}>
                Return to Week View
              </Button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
