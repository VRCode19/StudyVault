import React from 'react';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';
import { AIChat } from '../components/assistant/AIChat';
import { Badge } from '../components/common/Badge';

export const AssistantPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Studyvault AI Assistant
            </h1>
            <Badge variant="adaptive" size="sm">
              Live Copilot
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Intelligent timetable mediator. Ask to push sessions, rebalance workloads, or analyze subject weaknesses.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Autonomous Schedule Agent
          </span>
        </div>
      </div>

      {/* Main Full-Height Chat Component */}
      <AIChat fullHeight={true} />
    </div>
  );
};
