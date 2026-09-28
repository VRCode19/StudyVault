import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
  Trash2,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { Subject } from '../types/studyvault';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassProgress } from '../components/common/GlassProgress';
import { GlassModal } from '../components/common/GlassModal';
import { GlassInput } from '../components/common/GlassInput';

export const SubjectsPage: React.FC = () => {
  const { subjects, addSubject, deleteSubject, setActivePage, exams, tasks } = useStudyVault();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [examDate, setExamDate] = useState('');

  // Professor & credits mapping
  const subjectMetadata: Record<string, { professor: string; credits: number; nextAssignment: string }> = {
    'sub-dsa': {
      professor: 'Dr. Robert Sedgewick',
      credits: 4,
      nextAssignment: 'Implement Red-Black Tree in C++',
    },
    'sub-dbms': {
      professor: 'Prof. Jennifer Widom',
      credits: 4,
      nextAssignment: 'DBMS Assignment 3: Relational Normalization',
    },
    'sub-ai': {
      professor: 'Dr. Andrew Ng',
      credits: 3,
      nextAssignment: 'Neural Networks & Backprop Project',
    },
    'sub-os': {
      professor: 'Dr. Remzi Arpaci-Dusseau',
      credits: 4,
      nextAssignment: 'Process Scheduling & Mutex Locks Lab',
    },
    'sub-math': {
      professor: 'Dr. Gilbert Strang',
      credits: 3,
      nextAssignment: 'Graph Theory & Trees Problem Set',
    },
  };

  const totalCredits = subjects.reduce((sum, s) => {
    return sum + (subjectMetadata[s.id]?.credits || 3);
  }, 0);

  const avgProgress =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.progressPercentage, 0) / subjects.length)
      : 0;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      code: code.trim() || 'CS101',
      accentColor,
      glowColor: `${accentColor}66`,
      totalTopics: 10,
      completedTopics: 0,
      totalMinutes: 400,
      completedMinutes: 0,
      progressPercentage: 0,
      examDate: examDate || undefined,
      topics: [
        {
          id: `top-${Date.now()}-1`,
          subjectId: '',
          name: 'Introduction & Core Foundations',
          module: 'Module 1',
          estimatedMinutes: 60,
          difficulty: 'easy',
          status: 'pending',
        },
      ],
    });

    setIsAddModalOpen(false);
    setName('');
    setCode('');
    setExamDate('');
  };

  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Subjects
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/15 text-blue-300 border border-blue-400/30">
              {subjects.length} Enrolled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your courses, faculty credits, syllabus modules, and preparation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="glass"
            size="md"
            icon={<BookOpen className="w-4 h-4 text-cyan-400" />}
            onClick={() => setActivePage('vault')}
          >
            Open Vault
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Subject
          </GlassButton>
        </div>
      </div>

      {/* Top Academic Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard level={2} rounded="md" className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Credits</span>
            <div className="text-2xl font-black text-white">{totalCredits} ECTS</div>
            <p className="text-[11px] text-cyan-400 font-mono">Academic Load Balanced</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-blue-glow/20">
            <Award className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard level={2} rounded="md" className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Average Mastery</span>
            <div className="text-2xl font-black text-white">{avgProgress}%</div>
            <p className="text-[11px] text-emerald-400 font-mono">All Courses Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-teal-glow/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard level={2} rounded="md" className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Next Exam Window</span>
            <div className="text-2xl font-black text-white">16 Days</div>
            <p className="text-[11px] text-orange-400 font-mono">Oct 14 Mid-Terms</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 shadow-orange-glow/20">
            <Calendar className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Subjects Grid with Custom Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const meta = subjectMetadata[sub.id] || {
            professor: 'Faculty Advisor',
            credits: 4,
            nextAssignment: 'Course Review & Project',
          };

          const relatedExam = exams.find((e) =>
            e.title.toLowerCase().includes(sub.name.toLowerCase()) ||
            sub.name.toLowerCase().includes(e.title.toLowerCase())
          );

          return (
            <GlassCard
              key={sub.id}
              level={2}
              rounded="md"
              className="p-6 space-y-4 hover:border-white/25 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between shadow-liquid-card"
            >
              <div className="space-y-4">
                {/* Header: Code & Credits */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub.accentColor, boxShadow: `0 0 10px ${sub.accentColor}` }}
                    />
                    <span className="text-xs font-mono font-bold text-slate-300">{sub.code}</span>
                  </div>
                  <GlassBadge variant="glass" size="xs">
                    {meta.credits} Credits
                  </GlassBadge>
                </div>

                {/* Title & Professor */}
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors tracking-tight">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{meta.professor}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Progress</span>
                    <span className="font-mono font-bold text-white">{sub.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900/60 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.progressPercentage}%`,
                        backgroundColor: sub.accentColor,
                        boxShadow: `0 0 12px ${sub.accentColor}`,
                      }}
                    />
                  </div>
                </div>

                {/* Next Assignment & Next Exam */}
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium shrink-0">Next:</span>
                    <span className="text-right text-slate-200 font-semibold truncate">
                      {meta.nextAssignment}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium shrink-0">Next Exam:</span>
                    <span className="text-right text-orange-300 font-mono font-semibold">
                      {sub.examDate || relatedExam?.date || 'October 14'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSubject(sub)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  View Syllabus ({sub.topics?.length || 0} topics) <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  title="Remove course"
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Syllabus / Module Details Modal */}
      {selectedSubject && (
        <GlassModal
          isOpen={Boolean(selectedSubject)}
          onClose={() => setSelectedSubject(null)}
          title={`${selectedSubject.name} (${selectedSubject.code})`}
          subtitle="Curriculum Modules & Topic Mastery"
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3.5 rounded-btn bg-white/[0.04] border border-white/10">
              <div>
                <span className="text-xs text-slate-400">Total Course Duration</span>
                <p className="text-sm font-bold text-white font-mono">{selectedSubject.totalMinutes} mins</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Topics Mastered</span>
                <p className="text-sm font-bold text-white font-mono">
                  {selectedSubject.completedTopics} / {selectedSubject.totalTopics}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Exam Readiness</span>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {selectedSubject.progressPercentage}%
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                selectedSubject.topics.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-btn liquid-glass-2 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">{t.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{t.module}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlassBadge
                        variant={t.difficulty === 'hard' ? 'rose' : t.difficulty === 'medium' ? 'orange' : 'teal'}
                        size="xs"
                      >
                        {t.difficulty}
                      </GlassBadge>
                      <GlassBadge
                        variant={t.status === 'completed' ? 'emerald' : t.status === 'in-progress' ? 'cyan' : 'neutral'}
                        size="xs"
                      >
                        {t.status}
                      </GlassBadge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No topics parsed yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <GlassButton variant="primary" size="md" onClick={() => setSelectedSubject(null)}>
                Done
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Add Subject Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Course to Vault"
        subtitle="Register a new academic course"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name</label>
            <GlassInput
              placeholder="e.g. Distributed Cloud Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Course Code</label>
              <GlassInput
                placeholder="e.g. CS502"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Final Exam Date</label>
              <GlassInput
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Accent Glow Color</label>
            <div className="flex items-center gap-3">
              {['#2563eb', '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-7 h-7 rounded-full border transition-transform ${
                    accentColor === c ? 'scale-125 border-white ring-2 ring-white/50' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Add Subject
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
