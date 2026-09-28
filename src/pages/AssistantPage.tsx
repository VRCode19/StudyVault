import React from 'react';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';
import { AIChat } from '../components/assistant/AIChat';
import { GlassBadge } from '../components/common/GlassBadge';

export const AssistantPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Academic Strategist
            </h1>
            <GlassBadge variant="cyan" size="sm">
              Copilot Active
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multimodal syllabus synthesizer, adaptive timetable mediator, and personalized revision mentor.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-400/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Autonomous Schedule Agent
          </span>
        </div>
      </div>

      {/* Main Full-Height Chat Component */}
      <AIChat fullHeight={true} />
    </div>
  );
};
