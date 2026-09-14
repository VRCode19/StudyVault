import React from 'react';
import { Bot, User, ShieldCheck, Check, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/studyvault';
import { useStudyVault } from '../../context/StudyVaultContext';
import { Button } from '../common/Button';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { applyChatActionCard } = useStudyVault();
  const isAI = message.sender === 'assistant';

  return (
    <div className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Avatar */}
      {isAI && (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shrink-0 shadow-cyan-glow/40 border border-cyan-400/30">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Bubble */}
      <div
        className={`max-w-xl rounded-card-sm p-4 text-sm leading-relaxed border transition-all ${
          isAI
            ? 'bg-dark-850/80 border-white/10 text-slate-200'
            : 'bg-blue-600/30 border-blue-500/40 text-white shadow-blue-glow/20'
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-1 text-[11px] font-mono text-slate-400">
          <span className="font-semibold">{isAI ? 'Studyvault AI' : 'You'}</span>
          <span>{message.timestamp}</span>
        </div>

        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Tools executed badge if present */}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Grounded tools:</span>
            {message.toolsUsed.map((tool, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Embedded Action Card if present */}
        {message.actionCard && (
          <div className="mt-3.5 p-4 rounded-xl bg-dark-900/90 border border-cyan-500/30 shadow-cyan-glow/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight">
                  {message.actionCard.title}
                </span>
              </div>
              {message.actionCard.deadlineProtected && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Safe
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-slate-400 text-[11px]">
                <strong className="text-slate-300">Origin:</strong> {message.actionCard.originalSummary}
              </div>
              <div className="text-cyan-300 text-[11px]">
                <strong className="text-cyan-200">Adaptation:</strong> {message.actionCard.updatedSummary}
              </div>
            </div>

            {/* Shifts list */}
            <div className="space-y-1.5 pt-1">
              {message.actionCard.shifts.map((shift, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px]"
                >
                  <span className="text-slate-200 font-medium">{shift.subject}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <span className="text-rose-300">{shift.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-cyan-300 font-semibold">{shift.to}</span>
                    <span className="text-slate-500">({shift.duration})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Accept / Revert buttons */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                size="xs"
                variant={message.actionCard.applied ? 'primary' : 'glass'}
                onClick={() => applyChatActionCard(message.id)}
                icon={
                  message.actionCard.applied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )
                }
              >
                {message.actionCard.applied ? 'Schedule Applied' : 'Undo Rebalance'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-white shrink-0 border border-white/10 font-bold text-xs">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
};
