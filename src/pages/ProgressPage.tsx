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
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { ProgressRing } from '../components/progress/ProgressRing';
import { SubjectProgress } from '../components/progress/SubjectProgress';
import { WeeklyChart } from '../components/progress/WeeklyChart';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const ProgressPage: React.FC = () => {
  const { stats, exams, subjects } = useStudyVault();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Progress & Velocity Analytics
            </h1>
            <Badge variant="on-track" size="sm">
              Ahead of Pace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time syllabus completion metrics, weekly study velocity, and retention health.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25">
            <Flame className="w-4 h-4 fill-amber-400" />
            {stats.streakDays} Day Study Streak
          </span>
        </div>
      </div>

      {/* TOP HERO METRICS: Overall Completion + Streak + Key Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Big Circular Progress Ring */}
        <div className="lg:col-span-5">
          <GlassCard variant="elevated" rounded="lg" className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <ProgressRing
              percentage={stats.weeklyProgressPercentage}
              size={190}
              strokeWidth={14}
              subtitle="Overall Completion"
            />

            <div className="mt-5 space-y-1.5">
              <div className="text-sm font-semibold text-white">
                {stats.completedTopics} of {stats.totalTopics} Topics Mastered
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Projected to achieve 100% syllabus mastery 3 days prior to your End Semester Examination.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right: Key Velocity Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Consistency Streak */}
          <GlassCard variant="default" rounded="md" className="p-5 space-y-2 border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Consistency</span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-200">
              {stats.streakDays} Days
            </div>
            <p className="text-xs text-slate-400">
              Longest streak: 12 days. Daily habit index is in top 5%.
            </p>
          </GlassCard>

          {/* Study Velocity */}
          <GlassCard variant="default" rounded="md" className="p-5 space-y-2 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Study Velocity</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-300">
              1.4x Pace
            </div>
            <p className="text-xs text-slate-400">
              +14% hours completed vs previous 7-day rolling window.
            </p>
          </GlassCard>

          {/* Retention Buffer */}
          <GlassCard variant="default" rounded="md" className="p-5 space-y-2 border-cyan-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Retention Window</span>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-300">
              92.4%
            </div>
            <p className="text-xs text-slate-400">
              Spaced repetition intervals dynamically scheduled.
            </p>
          </GlassCard>

          {/* Exam Runway */}
          <GlassCard variant="default" rounded="md" className="p-5 space-y-2 border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Earliest Deadline</span>
              <Hourglass className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-blue-300">
              6 Days
            </div>
            <p className="text-xs text-slate-400">
              Data Structures Lab Exam (Sep 17). Coverage: 82%.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* TWO ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Progress Bars (6 cols) */}
        <div className="lg:col-span-6">
          <SubjectProgress />
        </div>

        {/* Weekly Study Hours Chart (6 cols) */}
        <div className="lg:col-span-6">
          <WeeklyChart />
        </div>
      </div>

      {/* UPCOMING DEADLINES STATUS TABLE */}
      <GlassCard variant="default" rounded="lg" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Exam Deadlines & Buffer Protection
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target examination milestones locked into Studyvault's redistribution algorithm.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> All Deadlines Safe
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {exam.daysRemaining} days remaining
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {exam.readinessPercentage}% ready
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{exam.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{exam.subtitle}</p>
              </div>

              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/[0.04]">
                Target Date: {exam.date}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
