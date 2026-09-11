import React, { useState, useEffect } from 'react';
import { Search, Calendar, BookOpen, BarChart3, Bot, Settings, ArrowRight } from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { Modal } from './Modal';
import { ActivePage } from '../../types/studyvault';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActivePage, subjects, sessions } = useStudyVault();
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

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    setIsSearchOpen(false);
    setQuery('');
  };

  const filteredSubjects = query
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredSessions = query
    ? sessions.filter(
        (s) =>
          s.topicName.toLowerCase().includes(query.toLowerCase()) ||
          s.subjectName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const quickPages = [
    { label: 'Dashboard', page: 'dashboard' as ActivePage, icon: <ArrowRight className="w-4 h-4" /> },
    { label: 'Adaptive Schedule', page: 'schedule' as ActivePage, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Syllabus Management', page: 'syllabus' as ActivePage, icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Progress & Analytics', page: 'progress' as ActivePage, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Studyvault AI Assistant', page: 'assistant' as ActivePage, icon: <Bot className="w-4 h-4" /> },
    { label: 'Settings', page: 'settings' as ActivePage, icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} maxWidth="xl">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects, topics, sessions, or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-900/90 text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
        </div>

        {/* Results / Navigation */}
        <div className="max-h-[360px] overflow-y-auto space-y-4 pr-1">
          {/* Subjects Matching */}
          {filteredSubjects.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
                Subjects
              </div>
              <div className="space-y-1">
                {filteredSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => navigateTo('syllabus')}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.accentColor }}
                      />
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-300">
                          {sub.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {sub.code} • {sub.completedTopics}/{sub.totalTopics} topics ({sub.progressPercentage}%)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-300">View in Syllabus →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sessions Matching */}
          {filteredSessions.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
                Study Sessions
              </div>
              <div className="space-y-1">
                {filteredSessions.slice(0, 4).map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => navigateTo('schedule')}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-cyan-300">
                        {sess.topicName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {sess.subjectName} • {sess.dayOfWeek} {sess.startTime}-{sess.endTime} ({sess.durationMinutes}m)
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-300">Open in Schedule →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Jump List */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
              Quick Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickPages.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm transition-colors text-left"
                >
                  <span className="p-1.5 rounded-lg bg-white/[0.05] text-blue-400">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">ESC</kbd> to close
          </span>
        </div>
      </div>
    </Modal>
  );
};
