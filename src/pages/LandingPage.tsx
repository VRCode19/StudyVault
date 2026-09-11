import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  BookOpen,
  Bot,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  Cpu,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { GlassCard } from '../components/common/GlassCard';
import { ProgressRing } from '../components/progress/ProgressRing';

export const LandingPage: React.FC = () => {
  const { setActivePage, stats } = useStudyVault();

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 relative overflow-hidden selection:bg-blue-600/30">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 ambient-hero-mesh" />

      {/* Navigation bar */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-glow border border-white/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">Studyvault</span>
            <span className="ml-1.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              OS
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Adaptive Engine
          </a>
          <a href="#preview" className="hover:text-white transition-colors">
            Interface
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setActivePage('dashboard')}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActivePage('dashboard')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Launch App
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Small badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono mb-6 shadow-cyan-glow/20 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI-powered adaptive study planning</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Your syllabus.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
            A schedule that adapts.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Studyvault turns your syllabus into an intelligent study plan that automatically adjusts around your progress, missed sessions, and exam deadlines.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setActivePage('syllabus')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="shadow-blue-glow-lg text-sm sm:text-base px-7 py-3.5"
          >
            Build my study plan
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={() => {
              const el = document.getElementById('preview');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm sm:text-base px-7 py-3.5"
          >
            See how it works
          </Button>
        </div>

        {/* FLOATING GLASS DASHBOARD PREVIEW */}
        <div id="preview" className="mt-16 sm:mt-20 relative max-w-6xl mx-auto">
          {/* Ambient glow behind preview */}
          <div className="pointer-events-none absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-3xl blur-3xl opacity-75" />

          {/* Main Floating Glass Container */}
          <div className="relative rounded-card-lg sm:rounded-[32px] glass-card-elevated border-white/[0.14] shadow-2xl p-4 sm:p-7 text-left overflow-hidden">
            {/* Window header buttons */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  studyvault.os • intelligent timetable
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="deadline-protected" size="xs">
                  Protected (18d)
                </Badge>
                <Badge variant="adaptive" size="xs">
                  Continuous Engine
                </Badge>
              </div>
            </div>

            {/* Floating Product Elements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left col: Today's plan & Adaptive indicator (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Adaptive reschedule banner */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 shadow-cyan-glow/10 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-cyan-200">Adaptive Redistribution: </span>
                    <span className="text-slate-300">
                      Missed Database Systems session (1h) split into two 30m blocks across today & tomorrow. Exam deadline preserved.
                    </span>
                  </div>
                </div>

                {/* Today's Tasks */}
                <div className="p-4 rounded-xl bg-dark-900/80 border border-white/[0.07] space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs">
                    <span className="font-bold text-white">Today's Focus Plan</span>
                    <span className="text-slate-400 font-mono">3h 20m planned</span>
                  </div>

                  {/* Task 1 */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-300 line-through">
                          Binary Trees & Traversals
                        </div>
                        <div className="text-[10px] text-blue-400 font-mono">Data Structures • 45m</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Done
                    </span>
                  </div>

                  {/* Task 2 */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-400 animate-pulse shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Normalization (1NF, 2NF, 3NF)
                        </div>
                        <div className="text-[10px] text-cyan-300 font-mono">Database Systems • 1h</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                      Current
                    </span>
                  </div>

                  {/* Task 3 */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-300">
                          TCP 3-Way Handshake
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Computer Networks • 45m</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">16:30</span>
                  </div>
                </div>

                {/* AI Assistant Message Preview */}
                <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/[0.08] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-cyan-glow">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-300">Studyvault AI: </strong>
                    "I noticed you completed Binary Trees 15 minutes faster than expected. I've reallocated that buffer to your Operating Systems review!"
                  </div>
                </div>
              </div>

              {/* Right col: Progress Ring + Exam Countdown + Mini Calendar (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Progress Ring Card */}
                <div className="p-4 rounded-xl bg-dark-900/80 border border-white/[0.07] flex items-center justify-around">
                  <ProgressRing percentage={68} size={130} strokeWidth={11} subtitle="Syllabus" />
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 font-mono">Exam Countdown</div>
                    <div className="text-2xl font-black text-white tracking-tight">
                      18 Days
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> On track for 98%
                    </div>
                  </div>
                </div>

                {/* Mini Calendar block */}
                <div className="p-3.5 rounded-xl bg-dark-900/80 border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>This Week (Adaptive Flow)</span>
                    <span className="text-blue-400">Week 37</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <div
                        key={i}
                        className={`p-1.5 rounded-lg ${
                          i === 4
                            ? 'bg-blue-600 text-white font-bold shadow-blue-glow'
                            : i < 4
                            ? 'bg-white/[0.05] text-slate-300'
                            : 'bg-white/[0.02] text-slate-500'
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Button inside preview */}
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-blue-glow flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Explore Interactive Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CORE PILLARS SECTION */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="adaptive" size="sm">
            Core Scheduling Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Why static study timetables always fail
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            One missed morning or sudden assignment ruins a static schedule. Studyvault continuously adapts like an intelligent GPS for your syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="default" rounded="lg" className="p-7 space-y-4 hover:border-blue-500/30">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Instant Session Redistribution
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Missed a session? Studyvault recalculates your week in seconds, splitting large modules into bite-sized retention blocks across open slots.
            </p>
          </GlassCard>

          <GlassCard variant="default" rounded="lg" className="p-7 space-y-4 hover:border-cyan-500/30">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Exam Deadline Protection
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Target exam dates act as immutable anchor points. The scheduler ensures 100% syllabus coverage with built-in revision buffer zones.
            </p>
          </GlassCard>

          <GlassCard variant="default" rounded="lg" className="p-7 space-y-4 hover:border-indigo-500/30">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Autonomous Syllabus Parser
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Drop any PDF or course text. The AI extracts modules, ranks topic difficulties, and estimates study time based on cognitive complexity.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto text-center">
        <GlassCard variant="elevated" rounded="lg" className="p-10 border-blue-500/30 shadow-blue-glow/20 space-y-6">
          <Badge variant="deadline-protected" size="sm">
            Begin Your Adaptive Plan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop stressing over broken timetables.
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Experience the study operating system built for students who want structure without rigidity.
          </p>
          <div>
            <Button
              variant="glow"
              size="lg"
              onClick={() => setActivePage('dashboard')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="px-8 py-3.5 text-base"
            >
              Open Studyvault Dashboard
            </Button>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-xs text-slate-500 border-t border-white/[0.05]">
        Studyvault AI • An Intelligent Study Operating System • Frontend Architecture
      </footer>
    </div>
  );
};
