import React from 'react';
import {
  Sliders,
  Bell,
  Palette,
  RotateCcw,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  User as UserIcon,
  LogOut,
  Mail,
  GraduationCap,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearUserData,
    currentUser,
    logout,
    stats,
    themeMode,
    toggleTheme,
    showToast,
  } = useStudyVault();

  const displayName = currentUser?.name || stats.studentName || 'Student';

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Preferences
            </h1>
            <GlassBadge variant="cyan" size="sm">
              Tuned to {displayName}
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure timetable algorithms, liquid glass aesthetics, and academic notifications.
          </p>
        </div>
      </div>

      {/* 0. USER ACCOUNT PROFILE CARD */}
      <GlassCard level={2} rounded="panel" className="p-6 border border-blue-500/25 shadow-liquid-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-blue-glow">
              <div className="w-full h-full rounded-[14px] bg-navy-950 flex items-center justify-center font-black text-xl text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">{displayName}</h3>
                <GlassBadge variant="emerald" size="xs">
                  Active Student
                </GlassBadge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser?.email || 'student@studyvault.ai'}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser?.major || 'Computer Science'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser?.semester || 'Term 4'}
                </span>
              </div>
            </div>
          </div>

          <GlassButton
            variant="glass"
            size="sm"
            onClick={logout}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            className="border-rose-500/30 text-rose-200"
          >
            Sign Out
          </GlassButton>
        </div>
      </GlassCard>

      {/* 1. THEME & APPEARANCE (Liquid Glass Dark & Light Modes) */}
      <GlassCard level={2} rounded="panel" className="p-6 space-y-5 border border-white/15 shadow-liquid-card">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Appearance & Liquid Glass</h3>
            <p className="text-xs text-slate-400">Choose between Deep Navy dark mode or Soft Liquid light mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <div
            onClick={() => {
              if (themeMode !== 'dark') toggleTheme();
            }}
            className={`p-5 rounded-card border transition-all cursor-pointer space-y-3 ${
              themeMode === 'dark'
                ? 'bg-navy-950/80 border-cyan-400/50 shadow-cyan-glow/20 ring-1 ring-cyan-400/40'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Deep Navy Atmosphere (Dark)</span>
              </div>
              {themeMode === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deep blue-black base (#07111F) with translucent floating glass, subtle radial blooms, and specular rims.
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => {
              if (themeMode !== 'light') toggleTheme();
            }}
            className={`p-5 rounded-card border transition-all cursor-pointer space-y-3 ${
              themeMode === 'light'
                ? 'bg-white/80 border-blue-500/50 shadow-blue-glow/20 ring-1 ring-blue-500/40 text-slate-900'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className={`text-sm font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Translucent Ice (Light)
                </span>
              </div>
              {themeMode === 'light' && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            <p className={`text-xs leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Soft white/blue-gray background (#F0F4F9) with translucent white liquid glass and crisp dark typography.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 2. STUDY PREFERENCES & CAPACITY */}
      <GlassCard level={2} rounded="panel" className="p-6 space-y-5 border border-white/15 shadow-liquid-card">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Study Capacity & Algorithm</h3>
            <p className="text-xs text-slate-400">Settings used by the adaptive schedule generator</p>
          </div>
        </div>

        {/* Daily Capacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white">Daily Study Capacity</label>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {settings.dailyStudyCapacityHours} Hours / Day
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            step={0.5}
            value={settings.dailyStudyCapacityHours}
            onChange={(e) =>
              updateSettings({ dailyStudyCapacityHours: parseFloat(e.target.value) })
            }
            className="w-full accent-cyan-400 h-2 bg-navy-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Preferred Time of Day */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-white block">Preferred Time of Day</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'morning', label: 'Morning (08:00 - 12:00)' },
              { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)' },
              { id: 'evening', label: 'Evening (17:00 - 21:00)' },
              { id: 'night', label: 'Late Night (21:00+)' },
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => updateSettings({ preferredTimeOfDay: slot.id as any })}
                className={`p-3 rounded-btn border text-left transition-all cursor-pointer ${
                  settings.preferredTimeOfDay === slot.id
                    ? 'bg-blue-600/25 border-blue-400 text-white shadow-liquid-sm'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{slot.id.toUpperCase()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{slot.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Interval Style */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-white block">Focus Interval / Break Rhythm</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'pomodoro_25', label: 'Pomodoro', desc: '25 min focus • 5 min break' },
              { id: 'deep_50', label: 'Deep Focus', desc: '50 min focus • 10 min break' },
              { id: 'standard_30', label: 'Balanced', desc: '30 min focus • 5 min break' },
            ].map((rhythm) => (
              <button
                key={rhythm.id}
                onClick={() => updateSettings({ breakDuration: rhythm.id as any })}
                className={`p-3 rounded-btn border text-left transition-all cursor-pointer ${
                  settings.breakDuration === rhythm.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-liquid-sm'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{rhythm.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{rhythm.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 3. ENGINE NOTIFICATIONS */}
      <GlassCard level={2} rounded="panel" className="p-6 space-y-4 border border-white/15 shadow-liquid-card">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Notifications & Engine Alerts</h3>
            <p className="text-xs text-slate-400">Automated signals when adjustments occur</p>
          </div>
        </div>

        {[
          {
            key: 'scheduleChangesAlert',
            title: 'Schedule Redistribution Alerts',
            desc: 'Get notified immediately whenever the AI rebalances or shifts a study session.',
          },
          {
            key: 'studyReminders',
            title: 'Study Window Reminders',
            desc: 'Gentle notification 10 minutes prior to scheduled deep-work focus sessions.',
          },
          {
            key: 'examCountdownAlert',
            title: 'Exam Runway Milestone Warnings',
            desc: 'Alerts at 14, 7, and 3 days before major examination deadlines.',
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <div>
              <div className="text-xs font-semibold text-white">{item.title}</div>
              <div className="text-[11px] text-slate-400">{item.desc}</div>
            </div>
            <button
              onClick={() =>
                updateSettings({
                  [item.key]: !settings[item.key as keyof typeof settings],
                })
              }
              className={`w-12 h-6 rounded-full p-1 transition-colors border cursor-pointer ${
                settings[item.key as keyof typeof settings]
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-navy-950 border-white/15'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings[item.key as keyof typeof settings]
                    ? 'translate-x-6'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </GlassCard>

      {/* 4. CLEAR / RESET WORKSPACE DATA */}
      <GlassCard level={1} rounded="panel" className="p-6 border border-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Reset StudyVault Workspace</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reset all course syllabuses, scheduled study sessions, and exams for your account to fresh defaults.
            </p>
          </div>
          <GlassButton
            variant="danger"
            size="sm"
            onClick={clearUserData}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Data
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
