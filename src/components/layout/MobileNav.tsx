import React from 'react';
import { LayoutDashboard, Calendar, BookOpen, BarChart3, Bot } from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { ActivePage } from '../../types/studyvault';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage } = useStudyVault();

  if (activePage === 'landing') return null;

  const items: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'assistant', label: 'AI', icon: <Bot className="w-5 h-5 text-cyan-400" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-dark-950/90 backdrop-blur-2xl border-t border-white/10">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
