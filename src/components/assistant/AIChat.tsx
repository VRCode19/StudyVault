import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Zap, Flame, ShieldCheck } from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { ChatMessage } from './ChatMessage';

export const AIChat: React.FC<{ fullHeight?: boolean }> = ({ fullHeight = true }) => {
  const { chatMessages, sendChatMessage, isAiThinking } = useStudyVault();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiThinking]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isAiThinking) return;
    sendChatMessage(input.trim());
    setInput('');
  };

  const quickPrompts = [
    { label: "I'm too tired to study today. Push my tasks.", icon: <Zap className="w-3 h-3 text-cyan-400" /> },
    { label: 'Plan tomorrow', icon: <Sparkles className="w-3 h-3 text-blue-400" /> },
    { label: 'What should I study next?', icon: <Flame className="w-3 h-3 text-amber-400" /> },
    { label: 'Show my progress', icon: <ShieldCheck className="w-3 h-3 text-emerald-400" /> },
  ];

  return (
    <GlassCard
      variant="default"
      rounded="lg"
      className={`flex flex-col ${fullHeight ? 'h-[calc(100vh-140px)] min-h-[550px]' : 'h-[500px]'}`}
    >
      {/* AI Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-dark-900/40">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-blue-glow border border-white/20">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-dark-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Studyvault AI</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Adaptive Agent
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-medium">● Ready to help</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Continuous Context</span>
          <span className="text-cyan-400">98% Engine Health</span>
        </div>
      </div>

      {/* Chat Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isAiThinking && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-850/60 border border-cyan-500/20 text-cyan-300 text-xs animate-pulse max-w-sm">
            <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Consulting backend schedule & exam runway...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="px-4 py-2 border-t border-white/[0.05] bg-dark-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0 mr-1">
            Suggestions:
          </span>
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              disabled={isAiThinking}
              onClick={() => sendChatMessage(item.label)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white text-xs whitespace-nowrap border border-white/10 transition-colors shrink-0 disabled:opacity-40"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-white/[0.08] bg-dark-900/60">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            disabled={isAiThinking}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAiThinking ? 'AI is processing...' : 'Tell Studyvault what you need...'}
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-dark-950/80 text-white placeholder-slate-500 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAiThinking}
            className="absolute right-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-40 disabled:pointer-events-none hover:shadow-cyan-glow transition-all active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </GlassCard>
  );
};
