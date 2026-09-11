import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Bot,
  Calendar,
  Check,
  Trash2,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    stats,
    notifications,
    setIsSearchOpen,
    setActivePage,
    markNotificationRead,
    clearAllNotifications,
  } = useStudyVault();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full py-4 px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-card glass-card border-white/[0.08] shadow-lg">
        {/* Left: Hamburger (mobile) + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Good morning, {stats.studentName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Sparkles className="w-3 h-3" />
                Adaptive Engine Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
              Here's your adaptive study plan for today.
            </p>
          </div>
        </div>

        {/* Right: Search, Notifications, AI quick action, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-dark-900/60 hover:bg-dark-900/90 text-slate-400 hover:text-slate-200 border border-white/10 transition-colors text-xs font-medium"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Search topics or sessions...</span>
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Quick AI Trigger */}
          <Button
            variant="glass"
            size="sm"
            onClick={() => setActivePage('assistant')}
            icon={<Bot className="w-4 h-4 text-cyan-400" />}
            className="border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-cyan-glow"
          >
            <span className="hidden sm:inline">Ask AI</span>
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center shadow-blue-glow">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-card glass-card-elevated border-white/15 shadow-2xl p-4 z-50 animate-scaleUp">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/20 text-blue-300">
                        {unreadCount} new
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
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
                          className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                            notif.read
                              ? 'bg-white/[0.02] border-white/[0.05] opacity-75'
                              : 'bg-white/[0.06] border-blue-500/25'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-semibold text-white leading-tight">
                              {notif.title}
                            </h5>
                            <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.details && (
                            <div className="mt-2 p-2 rounded-lg bg-dark-900/60 border border-white/5 text-[11px] font-mono space-y-1">
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

          {/* User Avatar */}
          <div
            onClick={() => setActivePage('settings')}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full rounded-[10px] bg-dark-900 flex items-center justify-center font-bold text-xs text-white">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
