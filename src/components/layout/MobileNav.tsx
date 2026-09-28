import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  CheckSquare,
  Calendar,
  Bot,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { ActivePage } from '../../types/studyvault';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage } = useStudyVault();

  if (activePage === 'landing' || activePage === 'login') return null;

  const items: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vault', label: 'Vault', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI', icon: <Bot className="w-4 h-4" /> },
  ];

  const isItemActive = (id: ActivePage) => {
    if (activePage === id) return true;
    if (id === 'calendar' && activePage === 'schedule') return true;
    if (id === 'vault' && activePage === 'syllabus') return true;
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-4 max-w-sm mx-auto z-40 p-1.5 rounded-chip liquid-panel shadow-liquid-modal border border-white/20 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-1">
        {items.map((item) => {
          const active = isItemActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-blue-600/60 to-cyan-500/60 text-white shadow-liquid-sm border border-white/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute -bottom-0.5 w-2 h-0.5 bg-cyan-300 rounded-full shadow-cyan-glow" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
