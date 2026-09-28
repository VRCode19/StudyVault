import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  BookOpen,
  BarChart3,
  Bot,
  Settings,
  ArrowRight,
  FolderArchive,
  CheckSquare,
  Hourglass,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassModal } from './GlassModal';
import { GlassBadge } from './GlassBadge';
import { ActivePage } from '../../types/studyvault';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActivePage,
    subjects,
    sessions,
    tasks,
    vaultResources,
    exams,
    setActiveNoteId,
  } = useStudyVault();

  const [query, setQuery] = useState('');

  // Handle Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const navigateTo = (page: ActivePage, noteId?: string) => {
    if (noteId) {
      setActiveNoteId(noteId);
    }
    setActivePage(page);
    setIsSearchOpen(false);
    setQuery('');
  };

  const q = query.trim().toLowerCase();

  // Search Notes
  const matchedNotes = q
    ? vaultResources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
      )
    : [];

  // Search Subjects
  const matchedSubjects = q
    ? subjects.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      )
    : [];

  // Search Tasks / Assignments
  const matchedTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      )
    : [];

  // Search Exams
  const matchedExams = q
    ? exams.filter(
        (e) => e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q)
      )
    : [];

  // Search Calendar sessions
  const matchedSessions = q
    ? sessions.filter(
        (s) => s.topicName.toLowerCase().includes(q) || s.subjectName.toLowerCase().includes(q)
      )
    : [];

  const quickPages = [
    { label: 'Home Dashboard', page: 'dashboard' as ActivePage, icon: <ArrowRight className="w-4 h-4 text-cyan-400" /> },
    { label: 'Study Vault (Library)', page: 'vault' as ActivePage, icon: <FolderArchive className="w-4 h-4 text-cyan-400" /> },
    { label: 'Subjects & Curriculum', page: 'subjects' as ActivePage, icon: <BookOpen className="w-4 h-4 text-blue-400" /> },
    { label: 'Tasks & Deliverables', page: 'tasks' as ActivePage, icon: <CheckSquare className="w-4 h-4 text-violet-400" /> },
    { label: 'Academic Calendar', page: 'calendar' as ActivePage, icon: <Calendar className="w-4 h-4 text-teal-400" /> },
    { label: 'Exam Milestones', page: 'exams' as ActivePage, icon: <Hourglass className="w-4 h-4 text-orange-400" /> },
    { label: 'Progress & Mastery', page: 'progress' as ActivePage, icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
    { label: 'AI Academic Assistant', page: 'assistant' as ActivePage, icon: <Bot className="w-4 h-4 text-cyan-300" /> },
    { label: 'Settings', page: 'settings' as ActivePage, icon: <Settings className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <GlassModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      showCloseButton={true}
      size="lg"
      className="p-4 sm:p-6"
    >
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-cyan-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes, subjects, tasks, assignments, exams, or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 rounded-btn liquid-input text-white placeholder-slate-400 text-sm font-medium border border-white/20 focus:border-cyan-400/60"
          />
          <kbd className="absolute right-3.5 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-slate-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Dynamic Search Results */}
        <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
          {/* 1. Matched Notes */}
          {matchedNotes.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold px-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes & Documents ({matchedNotes.length})
              </div>
              {matchedNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigateTo('vault', note.id)}
                  className="w-full flex items-center justify-between p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {note.title}
                      </h4>
                      <p className="text-xs text-slate-400">{note.subject}</p>
                    </div>
                  </div>
                  <GlassBadge variant="cyan" size="xs">
                    {note.type}
                  </GlassBadge>
                </button>
              ))}
            </div>
          )}

          {/* 2. Matched Tasks / Assignments */}
          {matchedTasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-violet-400 font-bold px-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> Tasks & Assignments ({matchedTasks.length})
              </div>
              {matchedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigateTo('tasks')}
                  className="w-full flex items-center justify-between p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-400">{t.subject} • {t.dueDate}</p>
                    </div>
                  </div>
                  <GlassBadge variant={t.priority === 'urgent' ? 'rose' : 'orange'} size="xs">
                    {t.priority}
                  </GlassBadge>
                </button>
              ))}
            </div>
          )}

          {/* 3. Matched Exams */}
          {matchedExams.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-orange-400 font-bold px-2 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5" /> Exams ({matchedExams.length})
              </div>
              {matchedExams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => navigateTo('exams')}
                  className="w-full flex items-center justify-between p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-300">
                      <Hourglass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                        {exam.title}
                      </h4>
                      <p className="text-xs text-slate-400">{exam.subtitle} • {exam.date}</p>
                    </div>
                  </div>
                  <GlassBadge variant="orange" size="xs">
                    {exam.daysRemaining}d left
                  </GlassBadge>
                </button>
              ))}
            </div>
          )}

          {/* 4. Matched Subjects */}
          {matchedSubjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-blue-400 font-bold px-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Subjects ({matchedSubjects.length})
              </div>
              {matchedSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => navigateTo('subjects')}
                  className="w-full flex items-center justify-between p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub.accentColor }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sub.code} • {sub.completedTopics}/{sub.totalTopics} topics ({sub.progressPercentage}%)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* 5. Matched Calendar Sessions */}
          {matchedSessions.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-teal-400 font-bold px-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Calendar Sessions ({matchedSessions.length})
              </div>
              {matchedSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => navigateTo('calendar')}
                  className="w-full flex items-center justify-between p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sess.subjectColor }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                        {sess.topicName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sess.subjectName} • {sess.dayOfWeek} {sess.startTime} ({sess.durationMinutes}m)
                      </p>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Page Jump Navigation if query is empty or not matching specific records */}
          {!q && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold px-2">
                Quick Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPages.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => navigateTo(item.page)}
                    className="flex items-center gap-3 p-3 rounded-card-sm liquid-glass-1 hover:border-white/20 text-left transition-all group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassModal>
  );
};
