import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const AdaptiveEngine: React.FC = () => {
  const { simulateMissedSession } = useStudyVault();

  return (
    <GlassCard
      variant="elevated"
      rounded="lg"
      className="p-5 sm:p-6 border-cyan-500/20 shadow-cyan-glow/10 relative overflow-hidden"
    >
      {/* Subtle ambient cyan glow background */}
      <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-cyan-glow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Your schedule adapts with you
              </h3>
              <Badge variant="deadline-protected" size="xs">
                Protected
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous deadline protection & dynamic session redistribution engine.
            </p>
          </div>
        </div>

        {/* Action Button to test adaptive engine */}
        <Button
          variant="glass"
          size="sm"
          onClick={simulateMissedSession}
          icon={<Zap className="w-3.5 h-3.5 text-cyan-400" />}
          className="border-cyan-500/30 hover:border-cyan-400 text-cyan-200"
        >
          Simulate Missed Session
        </Button>
      </div>

      {/* Notification banner */}
      <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-rose-200">Incident Detected: </span>
          <span className="text-slate-300">
            You missed yesterday's Database Systems session.
          </span>
        </div>
      </div>

      {/* Visual comparison flow */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Original */}
        <div className="md:col-span-5 p-4 rounded-card-sm bg-dark-900/60 border border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-2">
            <span>Original Schedule</span>
            <span className="text-rose-400">Missed</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Database Systems
              </div>
              <div className="text-xs text-slate-400">Normalization (1NF, 2NF, 3NF)</div>
            </div>
            <span className="px-2 py-1 rounded bg-white/[0.05] text-xs font-mono text-slate-300">
              1h 00m
            </span>
          </div>
        </div>

        {/* Transition arrow / Engine node */}
        <div className="md:col-span-2 flex flex-col items-center justify-center py-1 md:py-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-cyan-glow">
            <ArrowRight className="w-4 h-4 hidden md:block" />
            <RefreshCw className="w-4 h-4 md:hidden animate-spin text-cyan-400" />
          </div>
          <span className="text-[10px] font-mono text-cyan-400 mt-1 uppercase tracking-wider">
            Rebalanced
          </span>
        </div>

        {/* Updated / Adapted */}
        <div className="md:col-span-5 p-4 rounded-card-sm bg-cyan-950/20 border border-cyan-500/30 shadow-cyan-glow/20">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-cyan-300 font-mono mb-2">
            <span>Adaptive Resolution</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Deadline Safe
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-dark-900/70 border border-white/[0.05]">
              <span className="text-white font-medium">Today (17:30)</span>
              <span className="font-mono text-cyan-300 font-semibold">30 min</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-dark-900/70 border border-white/[0.05]">
              <span className="text-white font-medium">Tomorrow (13:30)</span>
              <span className="font-mono text-cyan-300 font-semibold">30 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation footer */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-start gap-2.5 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Studyvault Autonomous Engine: </strong>
          Studyvault redistributed the session across your available study time so your exam deadline stays protected without cramming.
        </p>
      </div>
    </GlassCard>
  );
};
