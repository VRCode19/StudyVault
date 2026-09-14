import React from 'react';
import {
  Bot,
  User,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/studyvault';
import { useStudyVault } from '../../context/StudyVaultContext';
import { Button } from '../common/Button';
import { ImageAttachment } from './ImageAttachment';
import { ExtractionPreviewCard } from './ExtractionPreviewCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { applyChatActionCard, confirmExtraction } = useStudyVault();
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

        {/* Render Attachments if present (images/documents) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {message.attachments.map((att) => (
              <ImageAttachment key={att.id} attachment={att} />
            ))}
          </div>
        )}

        {/* Text body */}
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

        {/* Standalone Extraction Preview if present */}
        {message.extractionPreview && (
          <ExtractionPreviewCard
            extraction={message.extractionPreview}
            onConfirm={() => confirmExtraction(message.id)}
            confirmed={message.extractionPreview.confirmed}
          />
        )}

        {/* Action Card Rendering */}
        {message.actionCard && (
          <div className="mt-3.5 space-y-3">
            {/* 1. Schedule Update Card */}
            {message.actionCard.type === 'schedule-update' && (
              <div className="p-4 rounded-xl bg-dark-900/90 border border-cyan-500/30 shadow-cyan-glow/10 space-y-3">
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
                    <strong className="text-slate-300">Origin:</strong>{' '}
                    {message.actionCard.originalSummary}
                  </div>
                  <div className="text-cyan-300 text-[11px]">
                    <strong className="text-cyan-200">Adaptation:</strong>{' '}
                    {message.actionCard.updatedSummary}
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

                {/* Accept / Revert buttons with corrected labels */}
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="xs"
                    variant={message.actionCard.applied ? 'glass' : 'primary'}
                    onClick={() => applyChatActionCard(message.id)}
                    icon={
                      message.actionCard.applied ? (
                        <RotateCcw className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    }
                  >
                    {message.actionCard.applied ? 'Applied (Undo Rebalance)' : 'Apply Schedule'}
                  </Button>
                </div>
              </div>
            )}

            {/* 2. Extraction Preview Card */}
            {message.actionCard.type === 'extraction-preview' && (
              <ExtractionPreviewCard
                extraction={message.actionCard.extraction}
                onConfirm={() => confirmExtraction(message.id)}
                confirmed={message.actionCard.applied}
              />
            )}

            {/* 3. Schedule Proposal Card */}
            {message.actionCard.type === 'schedule-proposal' && (
              <div className="p-4 rounded-xl bg-dark-900/90 border border-blue-500/30 shadow-blue-glow/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white tracking-tight">
                      {message.actionCard.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {message.actionCard.sessionsCount} sessions ({message.actionCard.totalHours}h)
                  </span>
                </div>

                <p className="text-xs text-slate-300">{message.actionCard.description}</p>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {message.actionCard.sessions.map((sess, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px]"
                    >
                      <div>
                        <span className="text-white font-medium">{sess.subject}</span>
                        <span className="text-slate-400 ml-2">— {sess.topic}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {sess.day} {sess.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    size="xs"
                    variant={message.actionCard.applied ? 'glass' : 'primary'}
                    onClick={() => applyChatActionCard(message.id)}
                    icon={
                      message.actionCard.applied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )
                    }
                  >
                    {message.actionCard.applied ? 'Schedule Active' : 'Lock In Schedule'}
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Onboarding Progress Card */}
            {message.actionCard.type === 'onboarding-progress' && (
              <div className="p-4 rounded-xl bg-dark-900/90 border border-emerald-500/30 shadow-tactile space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {message.actionCard.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {message.actionCard.percentage}% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${message.actionCard.percentage}%` }}
                  />
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {message.actionCard.completedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-emerald-300 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                  {message.actionCard.pendingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-400 font-mono">
                      <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
