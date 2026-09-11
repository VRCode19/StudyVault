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
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, showToast } = useStudyVault();

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Settings & Study Preferences
            </h1>
            <Badge variant="ai-optimized" size="sm">
              Tuned to Alex
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure how Studyvault's autonomous scheduling engine balances your time and protects your exam deadlines.
          </p>
        </div>
      </div>

      {/* 1. STUDY PREFERENCES */}
      <GlassCard variant="default" rounded="lg" className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Study Preferences</h3>
            <p className="text-xs text-slate-400">Constraints used by the timetable algorithm</p>
          </div>
        </div>

        {/* Daily Study Capacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-white">Daily Study Capacity</label>
            <span className="font-mono text-cyan-300 font-bold">
              {settings.dailyStudyCapacityHours} hours / day
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
            className="w-full accent-blue-500 bg-dark-900 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 hr (Light)</span>
            <span>4 hrs (Recommended)</span>
            <span>8 hrs (Intense)</span>
          </div>
        </div>

        {/* Preferred Study Hours */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-white block">
            Preferred Study Window
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'morning', label: 'Morning', hours: '08:00 - 12:00' },
              { id: 'afternoon', label: 'Afternoon', hours: '13:00 - 17:00' },
              { id: 'evening', label: 'Evening', hours: '18:00 - 22:00' },
              { id: 'night', label: 'Night Owl', hours: '21:00 - 02:00' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateSettings({ preferredTimeOfDay: item.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.preferredTimeOfDay === item.id
                    ? 'bg-blue-600/20 border-blue-500/40 text-white shadow-blue-glow/20'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.hours}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Break Duration / Rhythm */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-white block">
            Cognitive Rhythm & Break Technique
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'pomodoro_25', title: 'Pomodoro (25m / 5m)', desc: 'High frequency focus sprints' },
              { id: 'deep_50', title: 'Deep Work (50m / 10m)', desc: 'Continuous immersion blocks' },
              { id: 'standard_30', title: 'Standard (30m / 5m)', desc: 'Balanced cognitive cadence' },
            ].map((rhythm) => (
              <button
                key={rhythm.id}
                onClick={() => updateSettings({ breakDuration: rhythm.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.breakDuration === rhythm.id
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-white shadow-cyan-glow/20'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{rhythm.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{rhythm.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekend Availability Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <div className="text-xs font-semibold text-white">Weekend Buffer Slots</div>
            <div className="text-[11px] text-slate-400">
              Allow Studyvault to schedule sessions or catch-up slots on Saturday & Sunday.
            </div>
          </div>
          <button
            onClick={() => updateSettings({ weekendAvailability: !settings.weekendAvailability })}
            className={`w-12 h-6 rounded-full p-1 transition-colors border ${
              settings.weekendAvailability
                ? 'bg-blue-600 border-blue-400'
                : 'bg-dark-900 border-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.weekendAvailability ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </GlassCard>

      {/* 2. NOTIFICATIONS & ALERTS */}
      <GlassCard variant="default" rounded="lg" className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400">
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
            desc: 'Get notified immediately whenever the AI rebalances or splits a session.',
          },
          {
            key: 'studyReminders',
            title: 'Study Window Reminders',
            desc: 'Gentle notification 10 minutes prior to scheduled deep-work sessions.',
          },
          {
            key: 'examCountdownAlert',
            title: 'Exam Runway Milestone Warnings',
            desc: 'Alerts at 14, 7, and 3 days before major examination deadlines.',
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
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
              className={`w-12 h-6 rounded-full p-1 transition-colors border ${
                settings[item.key as keyof typeof settings]
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-dark-900 border-white/10'
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

      {/* 3. APPEARANCE & GLASS INTENSITY */}
      <GlassCard variant="default" rounded="lg" className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Appearance & Glass Dynamics</h3>
            <p className="text-xs text-slate-400">Neo-Tactile glassmorphism intensity</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white block">Glass Intensity</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'subtle', label: 'Subtle Glass', blur: '12px blur' },
              { id: 'balanced', label: 'Balanced (Default)', blur: '18px blur' },
              { id: 'high', label: 'Tactile Ultra', blur: '28px blur' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => updateSettings({ glassIntensity: option.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.glassIntensity === option.id
                    ? 'bg-blue-600/20 border-blue-500/40 text-white shadow-blue-glow/20'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{option.label}</div>
                <div className="text-[10px] font-mono text-slate-400">{option.blur}</div>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 4. DEMO STATE MANAGEMENT */}
      <GlassCard variant="subtle" rounded="lg" className="p-6 space-y-4 border-rose-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Reset Demo Environment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restore the initial student profile for Alex, reset calendar sessions and clear local cache.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={resetDemoData}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
