import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Tag,
  AlertCircle,
  BookOpen,
  Target,
  Flame,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassModal } from '../common/GlassModal';
import { GlassInput } from '../common/GlassInput';
import { DayOfWeek, StudySession } from '../../types/studyvault';
import { getCompletedStudyForDate } from '../../services/studyTrackingService';

export const StudyCalendar: React.FC = () => {
  const {
    sessions,
    subjects,
    setSelectedSession,
    simulateMissedSession,
    addSession,
    stats,
    exams,
    tasks,
    generateTimetableFromSyllabus,
  } = useStudyVault();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);

  // Add Session form state
  const [newTopic, setNewTopic] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDay, setNewDay] = useState<DayOfWeek>('MON');
  const [newTime, setNewTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState(45);
  const [eventType, setEventType] = useState<'academic' | 'assignment' | 'exam' | 'personal'>('academic');

  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Current date calculations
  const now = new Date();
  const currentDayOfWeekIdx = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const currentDayName = days[currentDayOfWeekIdx];
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeekIdx);

  const monthYearStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDateStr = now.toISOString().split('T')[0];

  const dayDates = days.reduce<Record<DayOfWeek, { dateStr: string; dayNum: number; isToday: boolean; dateKey: string }>>(
    (acc, day, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isToday = idx === currentDayOfWeekIdx;
      acc[day] = {
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayNum: d.getDate(),
        isToday,
        dateKey: d.toISOString().split('T')[0],
      };
      return acc;
    },
    {} as any
  );

  // Load completed study records per date from central tracking service
  const [completedStudyMap, setCompletedStudyMap] = useState<Map<string, Map<string, number>>>(new Map());

  const loadCompletedStudy = useCallback(async () => {
    const map = new Map<string, Map<string, number>>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMap = await getCompletedStudyForDate(dateStr).catch(() => new Map<string, number>());
      map.set(dateStr, dayMap);
    }
    if (!map.has(todayDateStr)) {
      const todayMap = await getCompletedStudyForDate(todayDateStr).catch(() => new Map<string, number>());
      map.set(todayDateStr, todayMap);
    }
    setCompletedStudyMap(map);
  }, [monday, todayDateStr]);

  useEffect(() => {
    loadCompletedStudy();
    const interval = setInterval(loadCompletedStudy, 15000);
    return () => clearInterval(interval);
  }, [loadCompletedStudy]);

  // Today's per-subject progress summary (planned, completed, remaining)
  const todayCompleted = completedStudyMap.get(todayDateStr) || new Map<string, number>();
  const todaySubjectProgress = subjects
    .map((sub) => {
      const planned = sessions
        .filter(
          (s) =>
            (s.date === todayDateStr || s.dayOfWeek === currentDayName) &&
            (s.subjectId === sub.id || s.subjectName.toLowerCase() === sub.name.toLowerCase())
        )
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      if (planned === 0) return null;

      const completed =
        todayCompleted.get(sub.id) ||
        todayCompleted.get(sub.name.toLowerCase().trim()) ||
        0;
      const remaining = Math.max(0, planned - completed);
      const isDone = completed >= planned;

      return {
        subject: sub,
        planned,
        completed,
        remaining,
        isDone,
      };
    })
    .filter(Boolean) as Array<{
    subject: (typeof subjects)[0];
    planned: number;
    completed: number;
    remaining: number;
    isDone: boolean;
  }>;

  const handleAddSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const matchedSubject = subjects.find((s) => s.id === newSubjectId) || subjects[0];
    const subName = matchedSubject?.name || 'Self Study';
    const subColor = matchedSubject?.accentColor || '#3b82f6';

    const [h, m] = newTime.split(':').map(Number);
    const endMinutes = (h || 10) * 60 + (m || 0) + newDuration;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    addSession({
      subjectId: matchedSubject?.id || 'sub-custom',
      subjectName: subName,
      subjectColor: subColor,
      topicId: 'top-' + Date.now(),
      topicName: newTopic.trim(),
      startTime: newTime,
      endTime: endTimeStr,
      durationMinutes: newDuration,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: newDay,
      status: 'pending',
      isAdaptive: false,
    });

    setNewTopic('');
    setIsAddSessionOpen(false);
  };

  // Filter sessions by subject
  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectId === 'all') return true;
    return s.subjectId === selectedSubjectId;
  });

  // Get accent glow class for an event
  const getEventClass = (session: StudySession) => {
    // If it's linked to an exam
    if (session.topicName.toLowerCase().includes('exam') || session.topicName.toLowerCase().includes('midterm')) {
      return 'border-orange-500/35 bg-orange-500/10 shadow-orange-glow/20';
    }
    // If linked to assignment
    if (session.topicName.toLowerCase().includes('assignment') || session.topicName.toLowerCase().includes('lab')) {
      return 'border-purple-500/35 bg-purple-500/10 shadow-violet-glow/20';
    }
    // Default academic
    return 'border-blue-500/35 bg-blue-500/10 shadow-blue-glow/20';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls & Top Bar */}
      <div className="p-4 sm:p-5 rounded-panel liquid-glass-2 border border-white/15 shadow-liquid-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View toggle (Month / Week / Day) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-chip bg-navy-950/70 border border-white/10 shadow-inner">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Day
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">{monthYearStr}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Self-Rebalancing
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {subjects.length > 0 && (
              <GlassButton
                variant="glass"
                size="sm"
                onClick={() => generateTimetableFromSyllabus()}
                icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                className="border-cyan-400/30 text-xs"
              >
                Sync with Syllabus
              </GlassButton>
            )}
            <GlassButton
              variant="glass"
              size="sm"
              onClick={simulateMissedSession}
              icon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              className="text-xs"
            >
              Rebalance
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsAddSessionOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Session
            </GlassButton>
          </div>
        </div>

        {/* Legend / Category Guide & Subject Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          {/* Categories Legend */}
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-blue-glow" /> Academic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-violet-glow" /> Assignments
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-orange-glow" /> Exams
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-teal-glow" /> Personal
            </span>
          </div>

          {/* Subject Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedSubjectId === 'all'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              All Courses
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                  selectedSubjectId === sub.id
                    ? 'text-white border-white/30'
                    : 'text-slate-400 hover:text-slate-200 border-white/5'
                }`}
                style={{
                  backgroundColor: selectedSubjectId === sub.id ? `${sub.accentColor}30` : 'rgba(255,255,255,0.03)',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.accentColor }} />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Study Progress Tracker (Planned vs Completed vs Remaining) */}
        {todaySubjectProgress.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Today's Scheduled Study Targets
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {todaySubjectProgress.filter((p) => p.isDone).length} of {todaySubjectProgress.length} goals completed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {todaySubjectProgress.map((item) => (
                <div
                  key={item.subject.id}
                  className="p-2.5 rounded-card-sm liquid-glass-1 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.subject.accentColor }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate max-w-[140px]">{item.subject.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Planned: {item.planned}m • Completed: {item.completed}m
                      </div>
                    </div>
                  </div>
                  <div>
                    {item.isDone ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        {item.remaining}m left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          VIEW 1: WEEK GRID VIEW
          ------------------------------------------------------------- */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[850px] grid grid-cols-7 gap-3.5">
            {days.map((day) => {
              const dayInfo = dayDates[day];
              const daySessions = filteredSessions.filter((s) => s.dayOfWeek === day);
              const isToday = dayInfo?.isToday;

              return (
                <div
                  key={day}
                  className={`flex flex-col min-h-[540px] rounded-panel p-3 border transition-all duration-200 ${
                    isToday
                      ? 'liquid-glass-3 border-cyan-400/40 shadow-cyan-glow/20 ring-1 ring-cyan-400/30'
                      : 'liquid-glass-1 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Day Header with glowing glass highlight if today */}
                  <div className="pb-3 mb-3 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold font-mono tracking-wider ${
                            isToday ? 'text-cyan-300 font-extrabold' : 'text-slate-300'
                          }`}
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-400 text-navy-950 font-mono">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {dayInfo?.dateStr}
                      </div>
                    </div>

                    {daySessions.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white/[0.08] text-[10px] font-mono font-bold text-slate-200 flex items-center justify-center border border-white/10">
                        {daySessions.length}
                      </span>
                    )}
                  </div>

                  {/* Sessions Column */}
                  <div className="space-y-2.5 flex-1">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-3 text-center">
                        <span className="text-[11px] text-slate-500 font-mono">Open Window</span>
                      </div>
                    ) : (
                      daySessions.map((session) => {
                        const isDone = session.status === 'completed';
                        const isMissed = session.status === 'missed';

                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`p-3 rounded-btn border transition-all duration-200 cursor-pointer text-left group relative shadow-liquid-sm ${
                              isDone
                                ? 'bg-white/[0.02] border-white/5 opacity-60'
                                : isMissed
                                ? 'bg-rose-500/15 border-rose-500/40'
                                : `${getEventClass(session)} hover:-translate-y-0.5 hover:border-white/30`
                            }`}
                          >
                            {/* Color bar */}
                            <div
                              className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                              style={{ backgroundColor: session.subjectColor }}
                            />

                            <div className="pl-1.5 space-y-1.5">
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

                              <h5
                                className={`text-xs font-bold leading-tight ${
                                  isDone ? 'text-slate-400 line-through' : 'text-white group-hover:text-cyan-200'
                                }`}
                              >
                                {session.topicName}
                              </h5>

                              {/* Study tracking progress (planned vs completed vs remaining) */}
                              {(() => {
                                const targetDate = dayInfo?.dateKey || session.date || todayDateStr;
                                const dayRecs = completedStudyMap.get(targetDate);
                                const completedMins = dayRecs
                                  ? (dayRecs.get(session.subjectId) || dayRecs.get(session.subjectName.toLowerCase().trim()) || 0)
                                  : 0;
                                const plannedMins = session.durationMinutes || 45;
                                const remainingMins = Math.max(0, plannedMins - completedMins);
                                const isGoalMet = isDone || (plannedMins > 0 && completedMins >= plannedMins);

                                return (
                                  <div className="space-y-1 pt-1.5 border-t border-white/10">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                      <span>{session.startTime}</span>
                                      <span>{plannedMins}m planned</span>
                                    </div>
                                    {isGoalMet ? (
                                      <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Goal completed</span>
                                      </div>
                                    ) : completedMins > 0 ? (
                                      <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-cyan-300 font-semibold">{remainingMins}m left</span>
                                        <span className="text-slate-400">{completedMins}m done</span>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {remainingMins}m remaining
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
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
      )}

      {/* -------------------------------------------------------------
          VIEW 2: MONTH VIEW (Grid of Days)
          ------------------------------------------------------------- */}
      {viewMode === 'month' && (
        <div className="rounded-panel liquid-glass-2 p-6 border border-white/15 space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold font-mono text-slate-400 pb-2 border-b border-white/10">
            {days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNum = (idx % 31) + 1;
              const isToday = dayNum === now.getDate();
              const hasEvents = dayNum % 3 === 0 || isToday;

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] p-2.5 rounded-card-sm border transition-all ${
                    isToday
                      ? 'liquid-glass-3 border-cyan-400/50 shadow-cyan-glow/20 ring-1 ring-cyan-400/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-mono font-bold ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-cyan-glow" />
                    )}
                  </div>

                  {hasEvents && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 truncate border border-blue-400/30">
                        {idx % 2 === 0 ? 'DSA Trees' : 'DBMS Lab'}
                      </div>
                      {dayNum === 14 && (
                        <div className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-200 truncate border border-orange-400/30">
                          DBMS Exam
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 3: DAY VIEW (Hourly Focus Timeline)
          ------------------------------------------------------------- */}
      {viewMode === 'day' && (
        <div className="rounded-panel liquid-glass-2 p-6 border border-white/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Daily Focus Schedule</h3>
              <p className="text-xs text-slate-400">
                {currentDayName}, {dayDates[currentDayName]?.dateStr}
              </p>
            </div>
            <GlassBadge variant="cyan" size="sm">
              Today
            </GlassBadge>
          </div>

          <div className="space-y-3">
            {(() => {
              const todaySessions = filteredSessions.filter(
                (s) => s.date === todayDateStr || s.dayOfWeek === currentDayName
              );

              if (todaySessions.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400 liquid-glass-1 rounded-panel border border-white/10">
                    <CalendarCheck className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-white">No Study Sessions Scheduled for Today</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Session" above or ask the AI Strategist to plan your focus blocks.</p>
                  </div>
                );
              }

              return todaySessions.map((s) => {
                const dayRecs = completedStudyMap.get(todayDateStr);
                const completedMins = dayRecs
                  ? (dayRecs.get(s.subjectId) || dayRecs.get(s.subjectName.toLowerCase().trim()) || 0)
                  : 0;
                const plannedMins = s.durationMinutes || 45;
                const remainingMins = Math.max(0, plannedMins - completedMins);
                const isGoalMet = s.status === 'completed' || (plannedMins > 0 && completedMins >= plannedMins);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    className="p-4 rounded-btn liquid-glass-2 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all shadow-liquid-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-300 min-w-[100px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {s.startTime} - {s.endTime}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.subjectColor, boxShadow: `0 0 10px ${s.subjectColor}` }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.topicName}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {s.subjectName} • Planned: {plannedMins}m • Completed: {completedMins}m • Remaining: {remainingMins}m
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGoalMet ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Study goal completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                          {remainingMins}m remaining
                        </span>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      <GlassModal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
        title="Schedule Study Session"
        subtitle="Add a focus window to your academic calendar"
      >
        <form onSubmit={handleAddSessionSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Topic or Task Name</label>
            <GlassInput
              placeholder="e.g. Dijkstra Shortest Path Algorithm"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-navy-950 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Day of Week</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as any)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="bg-navy-950 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
              <GlassInput
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (minutes)</label>
              <GlassInput
                type="number"
                min={15}
                max={180}
                step={15}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="secondary" size="md" onClick={() => setIsAddSessionOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Add Session
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
