import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Bot,
  Trash2,
  LogOut,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassButton } from '../common/GlassButton';
import { GlassIconButton } from '../common/GlassIconButton';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    currentUser,
    logout,
    stats,
    notifications,
    setIsSearchOpen,
    setActivePage,
    markNotificationRead,
    clearAllNotifications,
    themeMode,
    setThemeMode,
    toggleTheme,
  } = useStudyVault();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = currentUser?.name || stats.studentName || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 w-full py-3.5 px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-panel liquid-glass-2 border border-white/15 shadow-liquid-card">
        {/* Left: Mobile hamburger + Dynamic Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-btn text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
                {getGreeting()}, {displayName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Adaptive OS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
              Ready to make some progress?
            </p>
          </div>
        </div>

        {/* Right: Quick Search, AI Shortcut, Theme Toggle, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Quick Search Button (Ctrl + K) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-btn bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/15 transition-all text-xs font-medium cursor-pointer shadow-liquid-sm"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-slate-400">Search notes, tasks, exams...</span>
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* AI Shortcut */}
          <GlassButton
            variant="glass"
            size="sm"
            onClick={() => setActivePage('assistant')}
            icon={<Bot className="w-3.5 h-3.5 text-cyan-400" />}
            className="border-cyan-400/30 hover:border-cyan-300/50"
          >
            <span className="hidden sm:inline text-xs font-semibold">AI Assistant</span>
          </GlassButton>

          {/* Dark Mode & White Mode Buttons */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-liquid-sm">
            <button
              type="button"
              id="topbar-dark-mode-btn"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              type="button"
              id="topbar-white-mode-btn"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to White Mode"
              aria-label="White Mode"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">White</span>
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <GlassIconButton
              size="sm"
              variant="glass"
              icon={<Bell className="w-4 h-4 text-slate-200" />}
              badge={unreadCount > 0 ? unreadCount : undefined}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              label="Notifications"
            />

            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-card liquid-glass-4 border border-white/20 shadow-liquid-modal p-4 z-50 animate-scaleUp">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {unreadCount} new
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications right now.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 rounded-card-sm border transition-colors cursor-pointer ${
                            notif.read
                              ? 'bg-white/[0.02] border-white/[0.05] opacity-75'
                              : 'bg-white/[0.07] border-cyan-500/30 shadow-liquid-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-semibold text-white leading-tight">
                              {notif.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.details && (
                            <div className="mt-2 p-2 rounded-lg bg-navy-950/80 border border-white/10 text-[11px] font-mono space-y-1">
                              <div className="text-slate-400">
                                <span className="text-rose-400 font-semibold">Missed:</span>{' '}
                                {notif.details.original}
                              </div>
                              <div className="text-cyan-300">
                                <span className="text-emerald-400 font-semibold">Adapted:</span>{' '}
                                {notif.details.updated}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 cursor-pointer hover:scale-105 transition-transform shadow-liquid-sm"
              aria-label="User profile menu"
            >
              <div className="w-full h-full rounded-[14px] bg-navy-950 flex items-center justify-center font-bold text-xs text-white">
                {initial}
              </div>
            </div>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-64 rounded-card liquid-glass-4 border border-white/20 shadow-liquid-modal p-4 z-50 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-liquid-sm">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{displayName}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {currentUser?.email || 'Student Account'}
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                        {currentUser?.major || 'General Studies'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActivePage('settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings & Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
