import React from 'react';
import {
  Clock,
  TrendingUp,
  BookOpen,
  Hourglass,
  Sparkles,
  Bot,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { StatCard } from '../components/dashboard/StatCard';
import { TodayPlan } from '../components/dashboard/TodayPlan';
import { AdaptiveEngine } from '../components/dashboard/AdaptiveEngine';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { stats, setActivePage, exams, subjects } = useStudyVault();

  // Format today's study time
  const hours = Math.floor(stats.todayStudyMinutes / 60);
  const mins = stats.todayStudyMinutes % 60;
  const todayStudyFormatted = `${hours}h ${mins}m`;

  return (
    <div className="space-y-6 pb-12">
      {/* 4 TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Today's Study"
          value={todayStudyFormatted}
          subtitle="Target: 4h 00m"
          progress={(stats.todayStudyMinutes / stats.todayTargetMinutes) * 100}
          icon={<Clock className="w-5 h-5" />}
        />

        <StatCard
          title="Weekly Progress"
          value={`${stats.weeklyProgressPercentage}%`}
          subtitle="Syllabus velocity"
          trend={{ value: '+14% vs last wk', isPositive: true }}
          progress={stats.weeklyProgressPercentage}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          title="Topics Completed"
          value={`${stats.completedTopics} / ${stats.totalTopics}`}
          subtitle="4 active CS subjects"
          progress={(stats.completedTopics / stats.totalTopics) * 100}
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
        />

        <StatCard
          title="Exam Countdown"
          value={`${stats.examCountdownDays} days`}
          subtitle="End Semester Exam"
          trend={{ value: 'Protected status', isPositive: true }}
          icon={<Hourglass className="w-5 h-5 text-cyan-400" />}
        />
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (8 cols): Today's Plan + Adaptive Schedule Engine */}
        <div className="lg:col-span-8 space-y-6">
          <TodayPlan />
          <AdaptiveEngine />
        </div>

        {/* Right column (4 cols): Exam Deadlines, Quick AI Strategy, Mini Calendar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick AI Study Assistant Widget */}
          <GlassCard variant="default" rounded="lg" className="p-5 space-y-4 border-cyan-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Strategy Insight</h3>
                  <p className="text-[11px] text-slate-400">Personalized study advice</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-dark-900/60 p-3 rounded-xl border border-white/[0.04]">
              "Shifting <strong>Computer Networks</strong> to 16:30 gives you a 45-minute focus window with <strong>94% retention probability</strong> based on your cognitive energy curve."
            </p>

            <Button
              variant="glow"
              size="sm"
              onClick={() => setActivePage('assistant')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="w-full text-xs"
            >
              Open AI Assistant
            </Button>
          </GlassCard>

          {/* Upcoming Exam Deadlines */}
          <GlassCard variant="default" rounded="lg" className="p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Deadlines</h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> All Safe
              </span>
            </div>

            <div className="space-y-2.5">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-semibold text-white leading-tight">
                      {exam.title}
                    </h5>
                    <span className="text-xs font-mono font-bold text-cyan-300 shrink-0">
                      {exam.daysRemaining}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{exam.subtitle}</span>
                    <span className="font-mono text-emerald-400">{exam.readinessPercentage}% ready</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActivePage('schedule')}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors text-center"
            >
              View Full Exam Schedule →
            </button>
          </GlassCard>

          {/* Quick Syllabus Progress Glance */}
          <GlassCard variant="default" rounded="lg" className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white tracking-tight">Subject Mastery</h3>
              <button
                onClick={() => setActivePage('progress')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Analytics →
              </button>
            </div>

            <div className="space-y-2.5">
              {subjects.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{sub.name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {sub.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.progressPercentage}%`,
                        backgroundColor: sub.accentColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
