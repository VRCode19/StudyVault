import React from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar as CalendarIcon,
  CheckSquare,
  GraduationCap,
  Play,
  ArrowRight,
  Clock,
  Hourglass,
  TrendingUp,
  Bot,
  ShieldCheck,
  FileText,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassProgress } from '../components/common/GlassProgress';

export const DashboardPage: React.FC = () => {
  const {
    stats,
    setActivePage,
    exams,
    subjects,
    tasks,
    currentUser,
    setSelectedSession,
    sessions,
  } = useStudyVault();

  // Active course for Hero Card
  const activeSubject = subjects.length > 0 ? subjects[0] : null;
  const heroProgress = activeSubject ? activeSubject.progressPercentage : 68;
  const heroSubjectName = activeSubject ? activeSubject.name : 'Data Structures & Algorithms';
  const heroTopicName =
    activeSubject?.topics?.find((t) => t.status === 'in-progress')?.name ||
    'Arrays & Linked Lists';

  // Format today's study time
  const hours = Math.floor(stats.todayStudyMinutes / 60);
  const mins = stats.todayStudyMinutes % 60;
  const todayStudyFormatted = `${hours}h ${mins}m`;

  const targetHours = Math.floor((stats.todayTargetMinutes || 240) / 60);
  const targetFormatted = `Target: ${targetHours}h`;

  const earliestExam = exams.length > 0 ? exams[0] : null;

  // Upcoming items: uncompleted tasks and deadlines
  const upcomingTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  // Quick Action Handler
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'notes':
        setActivePage('vault');
        break;
      case 'assignments':
      case 'tasks':
        setActivePage('tasks');
        break;
      case 'calendar':
        setActivePage('calendar');
        break;
      case 'subjects':
        setActivePage('subjects');
        break;
      case 'session':
        if (sessions.length > 0) {
          setSelectedSession(sessions[0]);
        } else {
          setActivePage('calendar');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-7 pb-16">
      {/* 1. HERO CARD: "Continue Learning" (Cyan/Blue/Violet Lighting) */}
      <div className="relative rounded-panel overflow-hidden liquid-glass-3 p-6 sm:p-8 border border-white/20 shadow-liquid-elevated">
        {/* Soft atmospheric background light blooms */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONTINUE LEARNING</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {heroSubjectName}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-1 font-medium">
                Current topic: <span className="text-white font-semibold">{heroTopicName}</span>
              </p>
            </div>

            {/* Progress Bar & Last Accessed */}
            <div className="pt-2 max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-cyan-300">{heroProgress}% complete</span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" /> Last accessed today
                </span>
              </div>
              <GlassProgress value={heroProgress} variant="gradient" size="md" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <GlassButton
              variant="glow"
              size="lg"
              onClick={() => setActivePage('vault')}
              icon={<Play className="w-4 h-4 fill-white text-white" />}
              iconPosition="left"
              className="text-sm font-bold shadow-cyan-glow"
            >
              Continue Learning
            </GlassButton>
            <GlassButton
              variant="glass"
              size="lg"
              onClick={() => setActivePage('assistant')}
              icon={<Bot className="w-4 h-4 text-cyan-400" />}
              className="text-sm font-semibold"
            >
              Ask AI Questions
            </GlassButton>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW: 4 Tactile Glass Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Study */}
        <GlassCard level={2} rounded="md" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Study</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{todayStudyFormatted}</div>
            <div className="text-xs text-slate-400 mt-0.5">{targetFormatted}</div>
          </div>
          <GlassProgress
            value={stats.todayTargetMinutes > 0 ? (stats.todayStudyMinutes / stats.todayTargetMinutes) * 100 : 0}
            variant="blue"
            size="sm"
          />
        </GlassCard>

        {/* Weekly Progress */}
        <GlassCard level={2} rounded="md" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Weekly Pace</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{stats.weeklyProgressPercentage}%</div>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">Syllabus on track</div>
          </div>
          <GlassProgress value={stats.weeklyProgressPercentage} variant="teal" size="sm" />
        </GlassCard>

        {/* Topics Covered */}
        <GlassCard level={2} rounded="md" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Topics Mastered</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {stats.completedTopics} / {stats.totalTopics || 18}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{subjects.length} Active Courses</div>
          </div>
          <GlassProgress
            value={stats.totalTopics > 0 ? (stats.completedTopics / stats.totalTopics) * 100 : 66}
            variant="violet"
            size="sm"
          />
        </GlassCard>

        {/* Exam Countdown */}
        <GlassCard level={2} rounded="md" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Next Milestone</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {earliestExam ? `${earliestExam.daysRemaining} days` : '16 days'}
            </div>
            <div className="text-xs text-orange-300 font-medium truncate mt-0.5">
              {earliestExam ? earliestExam.title : 'Database Systems'}
            </div>
          </div>
          <GlassProgress value={earliestExam ? earliestExam.readinessPercentage : 74} variant="orange" size="sm" />
        </GlassCard>
      </div>

      {/* 3. DASHBOARD QUICK ACTIONS (6 Glowing Liquid Tiles from Reference Image!) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-400">Tactile shortcuts across your academic system</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Liquid Glass UI
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {/* Action 1: Notes (Sky Blue Tile) */}
          <GlassCard
            tileColor="blue"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('notes')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
              Notes
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Browse study guides & cheatsheets
            </p>
          </GlassCard>

          {/* Action 2: Assignments (Violet Tile) */}
          <GlassCard
            tileColor="violet"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('assignments')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
              Assignments
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Upcoming homework & lab reports
            </p>
          </GlassCard>

          {/* Action 3: Tasks (Teal Tile) */}
          <GlassCard
            tileColor="teal"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('tasks')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors">
              Tasks
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Daily action items & revisions
            </p>
          </GlassCard>

          {/* Action 4: Calendar (Crystal Clear Refraction Tile) */}
          <GlassCard
            tileColor="clear"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('calendar')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors">
              Calendar
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Month, week & daily schedule
            </p>
          </GlassCard>

          {/* Action 5: Subjects (Amber Gold Tile) */}
          <GlassCard
            tileColor="amber"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('subjects')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
              Subjects
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Curriculum, credits & faculty
            </p>
          </GlassCard>

          {/* Action 6: Study Session (Warm Peach / Orange Tile) */}
          <GlassCard
            tileColor="orange"
            rounded="md"
            className="p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group"
            onClick={() => handleQuickAction('session')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-liquid-sm">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-orange-200 transition-colors">
              Study Session
            </h4>
            <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2">
              Focus timer & deep study
            </p>
          </GlassCard>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN SECTION: Today / Upcoming Rows + AI & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Today / Upcoming Glass Rows */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Upcoming & Deadlines
              </h3>
              <p className="text-xs text-slate-400">Critical deliverables and exams</p>
            </div>
            <button
              onClick={() => setActivePage('tasks')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              View All Tasks <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Example Assignment Row: DBMS Assignment */}
            <div
              onClick={() => setActivePage('tasks')}
              className="group p-4 rounded-card liquid-glass-2 border border-white/12 hover:border-violet-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-liquid-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/35 flex items-center justify-center text-purple-300 shrink-0 shadow-violet-glow/30">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    DBMS Assignment 3: Relational Normalization
                  </h4>
                  <p className="text-xs text-slate-400">Database Management Systems</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <GlassBadge variant="violet" size="sm">
                  Due tomorrow
                </GlassBadge>
                <GlassBadge variant="orange" size="sm">
                  High Priority
                </GlassBadge>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Example Lab / Task Row: Red-Black Tree */}
            <div
              onClick={() => setActivePage('tasks')}
              className="group p-4 rounded-card liquid-glass-2 border border-white/12 hover:border-blue-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-liquid-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/35 flex items-center justify-center text-blue-300 shrink-0 shadow-blue-glow/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Implement Red-Black Tree Rotation in C++
                  </h4>
                  <p className="text-xs text-slate-400">Data Structures & Algorithms</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <GlassBadge variant="blue" size="sm">
                  Due Oct 14
                </GlassBadge>
                <GlassBadge variant="rose" size="sm">
                  Urgent
                </GlassBadge>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Example Exam Row: DBMS Midterm */}
            <div
              onClick={() => setActivePage('exams')}
              className="group p-4 rounded-card liquid-glass-2 border border-white/12 hover:border-orange-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-liquid-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-400/35 flex items-center justify-center text-orange-300 shrink-0 shadow-orange-glow/30">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                    Database Systems Comprehensive Mid-Term
                  </h4>
                  <p className="text-xs text-slate-400">October 14 • 16 days remaining</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-mono font-semibold text-orange-300">
                  Syllabus: 74%
                </span>
                <GlassBadge variant="orange" size="sm">
                  Exam
                </GlassBadge>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Dynamic Tasks from Context */}
            {upcomingTasks.slice(0, 2).map((t) => (
              <div
                key={t.id}
                onClick={() => setActivePage('tasks')}
                className="group p-4 rounded-card liquid-glass-2 border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-400">{t.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-slate-400 font-mono">{t.dueDate}</span>
                  <GlassBadge variant={t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'orange' : 'teal'} size="sm">
                    {t.priority}
                  </GlassBadge>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): AI Strategy & Exam Deadlines */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Strategy Glass Card */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-4 border-cyan-500/25 shadow-cyan-glow/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">AI Strategy Insight</h4>
                  <p className="text-[11px] text-slate-400">Autonomous optimization</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-navy-950/60 p-3.5 rounded-btn border border-white/10 font-normal">
              "Your focus session for <strong>{heroSubjectName}</strong> is scheduled in your peak retention window today. Complete 2 revision blocks to reach 85% readiness before October 14."
            </p>

            <GlassButton
              variant="glow"
              size="sm"
              onClick={() => setActivePage('assistant')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="w-full text-xs font-bold"
            >
              Open AI Assistant
            </GlassButton>
          </GlassCard>

          {/* Upcoming Exam Milestones */}
          <GlassCard level={2} rounded="md" className="p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white tracking-tight">Exam Countdown</h4>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Protected
              </span>
            </div>

            <div className="space-y-2.5">
              {exams.slice(0, 3).map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => setActivePage('exams')}
                  className="p-3 rounded-btn bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-semibold text-white leading-tight">
                      {exam.title}
                    </h5>
                    <span className="text-xs font-mono font-bold text-orange-300 shrink-0">
                      {exam.daysRemaining}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{exam.subtitle}</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {exam.readinessPercentage}% ready
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActivePage('exams')}
              className="w-full py-2 rounded-btn text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors text-center cursor-pointer"
            >
              View Full Exam Schedule →
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
