import React, { useState, useEffect, useCallback } from 'react';
import {
  User as UserIcon,
  Calendar,
  Flame,
  Clock,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  BarChart3,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { GlassCard } from '../components/common/GlassCard';
import {
  computeStudyStatistics,
  getStudyHeatmapData,
  formatDuration,
  getSubjectStudyStats,
} from '../services/studyTrackingService';
import type { StudyStatistics, DayStudyData } from '../types/studyvault';

export const ProfilePage: React.FC = () => {
  const { currentUser, subjects } = useStudyVault();
  const [stats, setStats] = useState<StudyStatistics | null>(null);
  const [heatmapData, setHeatmapData] = useState<DayStudyData[]>([]);
  const [subjectStats, setSubjectStats] = useState<Map<string, { totalSeconds: number; todaySeconds: number; weekSeconds: number; sessionCount: number }>>(new Map());
  const [heatmapMonth, setHeatmapMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayStudyData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [statsResult, heatmap] = await Promise.all([
        computeStudyStatistics(),
        getStudyHeatmapData(120),
      ]);
      setStats(statsResult);
      setHeatmapData(heatmap);

      // Load per-subject stats
      const subMap = new Map<string, any>();
      for (const sub of subjects) {
        const s = await getSubjectStudyStats(sub.id);
        subMap.set(sub.id, s);
      }
      setSubjectStats(subMap);
    } catch (err) {
      console.error('[Profile] Failed to load study stats:', err);
    }
  }, [subjects]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  // ─── Calendar helpers ───
  const calYear = heatmapMonth.getFullYear();
  const calMonth = heatmapMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday = 0
  const monthName = heatmapMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getHeatmapIntensity = (seconds: number): string => {
    if (seconds === 0) return 'bg-navy-800/40';
    if (seconds < 900) return 'bg-blue-900/60'; // < 15min
    if (seconds < 1800) return 'bg-blue-700/60'; // < 30min
    if (seconds < 3600) return 'bg-blue-500/60'; // < 1h
    return 'bg-cyan-400/70'; // 1h+
  };

  const prevMonth = () => setHeatmapMonth(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setHeatmapMonth(new Date(calYear, calMonth + 1, 1));

  const calendarDays: (DayStudyData | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = heatmapData.find(h => h.date === dateStr);
    calendarDays.push(data || { date: dateStr, totalSeconds: 0, sessions: 0, subjects: [] });
  }

  const statCards = stats ? [
    { label: 'Total Study Time', value: formatDuration(stats.totalStudyTimeSeconds), icon: <Clock className="w-5 h-5" />, color: 'text-cyan-400' },
    { label: 'Today', value: formatDuration(stats.todayStudyTimeSeconds), icon: <Target className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'This Week', value: formatDuration(stats.thisWeekStudyTimeSeconds), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400' },
    { label: 'This Month', value: formatDuration(stats.thisMonthStudyTimeSeconds), icon: <BarChart3 className="w-5 h-5" />, color: 'text-teal-400' },
    { label: 'Avg Daily', value: formatDuration(stats.averageDailyStudySeconds), icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Avg Session', value: formatDuration(stats.averageSessionDurationSeconds), icon: <BookOpen className="w-5 h-5" />, color: 'text-rose-400' },
    { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: <Flame className="w-5 h-5" />, color: 'text-orange-400' },
    { label: 'Longest Streak', value: `${stats.longestStreak} days`, icon: <Award className="w-5 h-5" />, color: 'text-yellow-400' },
  ] : [];

  return (
    <div className="space-y-7 pb-20">
      {/* Profile Header */}
      <div className="rounded-panel liquid-glass-3 p-6 sm:p-8 border border-white/15 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg flex-shrink-0">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="w-10 h-10 text-white" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentUser?.name || 'Student'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 justify-center sm:justify-start">
            {currentUser?.email && (
              <span className="text-sm text-slate-400">{currentUser.email}</span>
            )}
            {currentUser?.major && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/15 text-blue-300 border border-blue-400/30">
                {currentUser.major}
              </span>
            )}
            {currentUser?.semester && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-violet-500/15 text-violet-300 border border-violet-400/30">
                {currentUser.semester}
              </span>
            )}
          </div>
          {stats && (
            <p className="text-xs text-slate-500 mt-2">
              {stats.totalStudyDays} study days • {stats.subjectsStudied} subjects • {stats.pdfsRead} PDFs read
            </p>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Study Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <GlassCard key={card.label} tileColor="clear" rounded="md" className="p-4">
              <div className={`${card.color} mb-2`}>{card.icon}</div>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Mini Calendar + Heatmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Study Calendar</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white min-w-[140px] text-center">{monthName}</span>
            <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="rounded-panel liquid-glass-2 p-4 sm:p-6 border border-white/10">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs text-slate-500 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                onClick={() => day && setSelectedDay(day)}
                disabled={!day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all relative ${
                  day
                    ? `${getHeatmapIntensity(day.totalSeconds)} hover:ring-1 hover:ring-cyan-400/50 cursor-pointer ${
                        selectedDay?.date === day.date ? 'ring-2 ring-cyan-400' : ''
                      }`
                    : 'bg-transparent'
                }`}
              >
                {day && (
                  <span className={day.totalSeconds > 0 ? 'text-white' : 'text-slate-600'}>
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Heatmap legend */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-navy-800/40" />
            <div className="w-3 h-3 rounded bg-blue-900/60" />
            <div className="w-3 h-3 rounded bg-blue-700/60" />
            <div className="w-3 h-3 rounded bg-blue-500/60" />
            <div className="w-3 h-3 rounded bg-cyan-400/70" />
            <span>More</span>
          </div>

          {/* Selected day details */}
          {selectedDay && selectedDay.totalSeconds > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-navy-800/40 border border-white/10">
              <p className="text-sm font-semibold text-white">
                {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-400">
                <span>Study time: <strong className="text-white">{formatDuration(selectedDay.totalSeconds)}</strong></span>
                <span>Sessions: <strong className="text-white">{selectedDay.sessions}</strong></span>
                {selectedDay.subjects.length > 0 && (
                  <span>Subjects: <strong className="text-white">{selectedDay.subjects.join(', ')}</strong></span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subject Breakdown */}
      {subjects.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Subject Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((sub) => {
              const ss = subjectStats.get(sub.id);
              return (
                <GlassCard key={sub.id} tileColor="clear" rounded="md" className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.accentColor }} />
                    <h3 className="text-sm font-bold text-white truncate">{sub.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Total</p>
                      <p className="text-white font-semibold">{ss ? formatDuration(ss.totalSeconds) : '0m'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Today</p>
                      <p className="text-white font-semibold">{ss ? formatDuration(ss.todaySeconds) : '0m'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">This Week</p>
                      <p className="text-white font-semibold">{ss ? formatDuration(ss.weekSeconds) : '0m'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Sessions</p>
                      <p className="text-white font-semibold">{ss?.sessionCount || 0}</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{sub.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-navy-800/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${sub.progressPercentage}%`, backgroundColor: sub.accentColor }}
                      />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
