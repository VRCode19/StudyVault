import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  Flame,
  Globe,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { ActivePage } from '../../types/studyvault';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activePage, setActivePage, stats, notifications } = useStudyVault();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'schedule',
      label: 'My Schedule',
      icon: <Calendar className="w-4 h-4" />,
      badge: 'Adaptive',
    },
    {
      id: 'syllabus',
      label: 'Syllabus',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: <Bot className="w-4 h-4 text-cyan-400" />,
      badge: 'Pro',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Floating Glass Sidebar Card */}
        <div className="relative flex flex-col justify-between h-full w-full rounded-card-lg glass-card border-white/[0.08] shadow-2xl p-4 overflow-hidden">
          {/* Subtle ambient light top corner */}
          <div className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl" />

          {/* Top: Logo and Navigation */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-between px-2 pt-1">
              <button
                onClick={() => handleNavClick('landing')}
                className="flex items-center gap-3 text-left group"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-glow border border-white/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-200 transition-colors">
                      Studyvault
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      OS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Adaptive Planner</p>
                </div>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Menu
              </div>
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-tactile text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600/20 text-white border border-blue-500/30 shadow-blue-glow/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium uppercase ${
                          item.badge === 'Adaptive'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Switch to Landing Page button */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => handleNavClick('landing')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-tactile text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Product Landing Page</span>
              </button>
            </div>
          </div>

          {/* Bottom: Streak & User profile card */}
          <div className="space-y-3 pt-4 border-t border-white/[0.07]">
            {/* Streak card */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-200">
                    {stats.streakDays} Day Streak
                  </div>
                  <div className="text-[10px] text-amber-400/80">Velocity: High (1.4x)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Active
              </span>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-tactile">
                  A
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{stats.studentName}</div>
                <div className="text-[11px] text-slate-400 truncate">CS Major • Sem 4</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
