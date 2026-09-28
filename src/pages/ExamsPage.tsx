import React, { useState } from 'react';
import {
  Hourglass,
  Calendar,
  AlertCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { ExamDeadline } from '../types/studyvault';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassProgress } from '../components/common/GlassProgress';
import { GlassModal } from '../components/common/GlassModal';
import { GlassInput } from '../components/common/GlassInput';

export const ExamsPage: React.FC = () => {
  const { exams, addExam, deleteExam, subjects, setActivePage } = useStudyVault();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Final Assessment • Main Auditorium');
  const [date, setDate] = useState('2026-10-14');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Database Management Systems');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const daysRemaining = Math.max(
      1,
      Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) || 14
    );

    addExam({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Comprehensive Assessment',
      date,
      daysRemaining,
      subjects: [subjectName],
      readinessPercentage: 60,
    });

    setIsAddModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Exam Milestones
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-orange-500/15 text-orange-300 border border-orange-400/30">
              {exams.length} Upcoming
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exam schedules, syllabus coverage, and targeted revision roadmaps.
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Exam
        </GlassButton>
      </div>

      {/* Featured Exam Spotlight Card (Warm Amber / Orange Liquid Surface) */}
      {selectedExam && (
        <div className="rounded-panel overflow-hidden liquid-glass-3 p-6 sm:p-8 border border-orange-400/30 shadow-liquid-elevated relative">
          {/* Ambient Orange & Violet Blooms */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GlassBadge variant="orange" size="sm">
                  NEXT EXAM
                </GlassBadge>
                <span className="text-xs font-mono text-slate-300">{selectedExam.subtitle}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" /> Protected Schedule
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {selectedExam.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {selectedExam.date}
                  </span>
                  <span>•</span>
                  <span className="text-orange-300 font-mono font-bold">
                    {selectedExam.daysRemaining} days remaining
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-72 p-4 rounded-card liquid-glass-2 border border-white/10 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Syllabus Coverage</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedExam.readinessPercentage}%
                  </span>
                </div>
                <GlassProgress value={selectedExam.readinessPercentage} variant="orange" size="md" />
                <p className="text-[11px] text-slate-400 text-right">Target: 100% 4 days before exam</p>
              </div>
            </div>

            {/* AI Study Recommendations */}
            <div className="p-4 sm:p-5 rounded-card bg-navy-950/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Study Recommendations & High-Yield Focus
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-btn bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-bold text-white">1. Master High-Weightage Chapters</span>
                  <p className="text-slate-400">
                    Prioritize transactions, normalization (1NF to BCNF), and B+ tree indexing.
                  </p>
                </div>
                <div className="p-3 rounded-btn bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-bold text-white">2. Daily 45m Past Paper Review</span>
                  <p className="text-slate-400">
                    Solve at least 2 multi-table join and SQL query optimization questions each day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Schedule Cards List */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Complete Exam Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const isSelected = selectedExam?.id === exam.id;

            return (
              <GlassCard
                key={exam.id}
                level={2}
                rounded="md"
                className={`p-5 flex flex-col justify-between hover:border-orange-400/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-liquid-sm ${
                  isSelected ? 'border-orange-400/50 ring-1 ring-orange-400/30' : ''
                }`}
                onClick={() => setSelectedExamId(exam.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-300 bg-orange-500/15 px-2.5 py-0.5 rounded-full border border-orange-400/30">
                      {exam.daysRemaining} days remaining
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteExam(exam.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-orange-200 transition-colors">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{exam.subtitle}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Syllabus Progress</span>
                      <span className="font-mono font-semibold text-white">
                        {exam.readinessPercentage}%
                      </span>
                    </div>
                    <GlassProgress value={exam.readinessPercentage} variant="orange" size="sm" />
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {exam.date}
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                    View Details →
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Add Exam Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Exam Milestone"
        subtitle="Add a test or final evaluation deadline"
      >
        <form onSubmit={handleAddExam} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Title</label>
            <GlassInput
              placeholder="e.g. Operating Systems Comprehensive Mid-Term"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="bg-navy-950 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Date</label>
              <GlassInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Venue / Subtitle</label>
            <GlassInput
              placeholder="e.g. Hall B • Written + Practical"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Save Exam Milestone
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
