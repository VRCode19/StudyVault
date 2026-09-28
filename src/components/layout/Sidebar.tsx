import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  GraduationCap,
  CheckSquare,
  Calendar,
  Hourglass,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { ActivePage } from '../../types/studyvault';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activePage, setActivePage, stats, notifications, currentUser, logout } = useStudyVault();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const displayName = currentUser?.name || stats.studentName || 'Student';
  const initial = displayName.charAt(0).toUpperCase();
  const majorSemester = `${currentUser?.major || 'Computer Science'} • ${currentUser?.semester || 'Term 4'}`;

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: <FolderArchive className="w-4 h-4 text-cyan-400" />,
      badge: 'Library',
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: <GraduationCap className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-4 h-4 text-violet-400" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4 text-teal-400" />,
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: <Hourglass className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: <Bot className="w-4 h-4 text-cyan-300" />,
      badge: 'Pro',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    if (onCloseMobile) onCloseMobile();
  };

  // Helper to test if item is active (supporting aliases like schedule -> calendar and syllabus -> vault)
  const isItemActive = (id: ActivePage) => {
    if (activePage === id) return true;
    if (id === 'calendar' && activePage === 'schedule') return true;
    if (id === 'vault' && activePage === 'syllabus') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#07111F]/70 backdrop-blur-md md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Floating Translucent Glass Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 flex flex-col justify-between p-3 sm:p-4 transition-transform duration-300 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="relative flex flex-col justify-between h-full w-full liquid-panel p-4 overflow-hidden border border-white/15">
          {/* Subtle top-left specular accent reflection */}
          <div className="pointer-events-none absolute -top-10 -left-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl" />

          {/* Top: Logo & Navigation */}
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Logo */}
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-3 text-left group"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-glow border border-white/30 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-200 transition-colors">
                      StudyVault
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      OS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Academic Workspace</p>
                </div>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
                Workspace
              </div>
              {navItems.map((item) => {
                const active = isItemActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 group cursor-pointer ${
                      active
                        ? 'bg-white/[0.12] text-white shadow-liquid-sm border border-white/25'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    {/* Active vertical glow indicator */}
                    {active && (
                      <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-cyan-glow" />
                    )}

                    <div className="flex items-center gap-3 pl-1.5">
                      <span
                        className={`transition-colors ${
                          active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          active
                            ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/40'
                            : 'bg-white/[0.05] text-slate-400 border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom: Profile & Notifications */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {/* Quick notifications pill */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-btn bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                <span>Notifications</span>
              </div>
              {unreadNotifs > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                  {unreadNotifs} new
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">All caught up</span>
              )}
            </button>

            {/* Profile Card */}
            <div className="flex items-center justify-between p-2 rounded-btn bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all group">
              <button
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-2.5 text-left min-w-0 flex-1"
              >
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-liquid-sm border border-white/30 shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{majorSemester}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
