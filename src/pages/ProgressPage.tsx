import React from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  Hourglass,
  Award,
  Sparkles,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { GlassCard } from '../components/common/GlassCard';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassProgress } from '../components/common/GlassProgress';

export const ProgressPage: React.FC = () => {
  const { stats, exams, subjects, tasks } = useStudyVault();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 5;

  const hoursStudied = Math.round((stats.todayStudyMinutes * 6.5) / 60) + 18; // Monthly aggregate estimate

  // Circular progress math
  const overallPercentage = stats.weeklyProgressPercentage || 68;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Progress
            </h2>
            <GlassBadge variant="emerald" size="sm">
              On Track
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time syllabus completion metrics, weekly study velocity, and exam readiness.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-400/30">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            {stats.streakDays || 5} Day Study Streak
          </span>
        </div>
      </div>

      {/* Hero Overview Grid: Circular Indicator + 4 Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Big Glass Circular Progress Indicator */}
        <div className="lg:col-span-5">
          <GlassCard level={3} rounded="panel" className="p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-liquid-elevated">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer soft glow */}
              <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                {/* Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Gradient Fill */}
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="url(#progressGrad)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {overallPercentage}%
                </span>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Overall Mastery
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <h4 className="text-sm font-bold text-white">
                {stats.completedTopics} of {stats.totalTopics || 18} Topics Mastered
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Projected to reach 100% syllabus coverage 4 days prior to your first midterm exam.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* 4 Core Glass Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Study Time */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-2 border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Study Time</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{hoursStudied} Hours</div>
            <p className="text-xs text-slate-400">+4.2 hrs vs last week's focus blocks</p>
            <GlassProgress value={78} variant="blue" size="sm" />
          </GlassCard>

          {/* 2. Tasks Completed */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-2 border-teal-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Tasks Completed</span>
              <CheckSquare className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {completedTasks} / {totalTasks}
            </div>
            <p className="text-xs text-emerald-400 font-semibold">100% on-time submission rate</p>
            <GlassProgress value={(completedTasks / totalTasks) * 100} variant="teal" size="sm" />
          </GlassCard>

          {/* 3. Consistency Streak */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-2 border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Daily Habit Index</span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300 tracking-tight">
              {stats.streakDays || 5} Days
            </div>
            <p className="text-xs text-slate-400">Longest: 14 days • Active momentum</p>
            <GlassProgress value={85} variant="orange" size="sm" />
          </GlassCard>

          {/* 4. Exam Readiness */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-2 border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Exam Readiness</span>
              <Hourglass className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-300 tracking-tight">
              {exams[0]?.readinessPercentage || 74}%
            </div>
            <p className="text-xs text-slate-400">Database Systems • Oct 14 milestone</p>
            <GlassProgress value={exams[0]?.readinessPercentage || 74} variant="violet" size="sm" />
          </GlassCard>
        </div>
      </div>

      {/* Subject-Wise Progress Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Subject-Wise Syllabus Velocity
          </h3>
          <span className="text-xs text-slate-400">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <GlassCard key={sub.id} level={2} rounded="md" className="p-5 space-y-3 shadow-liquid-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.accentColor, boxShadow: `0 0 10px ${sub.accentColor}` }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{sub.code}</span>
                  </div>
                </div>

                <span className="text-sm font-mono font-bold text-white">
                  {sub.progressPercentage}%
                </span>
              </div>

              <div className="w-full bg-slate-900/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sub.progressPercentage}%`,
                    backgroundColor: sub.accentColor,
                    boxShadow: `0 0 10px ${sub.accentColor}`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-white/10">
                <span>{sub.completedTopics} of {sub.totalTopics} topics</span>
                <span>{sub.completedMinutes} mins completed</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Weekly Velocity Glass Pillar Chart */}
      <GlassCard level={2} rounded="panel" className="p-6 space-y-5 shadow-liquid-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Focus Velocity</h3>
            <p className="text-xs text-slate-400">Daily study hours vs target study capacity</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-blue-600 to-cyan-400" /> Completed Hours
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-500" /> 4h Daily Target
            </span>
          </div>
        </div>

        {/* Minimal Glass Pillars */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-4 h-48 items-end">
          {[
            { day: 'Mon', hours: 3.5, target: 4 },
            { day: 'Tue', hours: 4.2, target: 4 },
            { day: 'Wed', hours: 4.8, target: 4 },
            { day: 'Thu', hours: 2.5, target: 4 },
            { day: 'Fri', hours: 4.0, target: 4 },
            { day: 'Sat', hours: 5.2, target: 4 },
            { day: 'Sun', hours: 3.0, target: 4 },
          ].map((item) => {
            const heightPercent = Math.min(100, (item.hours / 6) * 100);
            const isMet = item.hours >= item.target;

            return (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hours}h
                </span>

                <div className="w-full max-w-[40px] bg-slate-900/60 rounded-t-xl overflow-hidden p-0.5 border border-white/10 h-36 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isMet
                        ? 'bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 shadow-cyan-glow/30'
                        : 'bg-gradient-to-t from-slate-700 to-slate-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-xs font-mono font-semibold text-slate-300">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
