import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  Paperclip,
  Image as ImageIcon,
  X,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { ChatMessage } from './ChatMessage';
import { ImageAttachment } from './ImageAttachment';
import { ChatAttachment } from '../../types/studyvault';

export const AIChat: React.FC<{ fullHeight?: boolean }> = ({ fullHeight = true }) => {
  const { chatMessages, sendChatMessage, isAiThinking } = useStudyVault();
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachmentsPreview, setAttachmentsPreview] = useState<ChatAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiThinking, attachmentsPreview]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      attachmentsPreview.forEach((att) => {
        if (att.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, [attachmentsPreview]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: ChatAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isText = file.type.startsWith('text/') || file.name.endsWith('.md');

      if (!isImage && !isPdf && !isText) return;

      newFiles.push(file);
      newPreviews.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: isImage ? 'image' : isPdf ? 'pdf' : 'text',
        previewUrl: isImage ? URL.createObjectURL(file) : '',
      });
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setAttachmentsPreview((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const preview = attachmentsPreview[index];
    if (preview && preview.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachmentsPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isAiThinking) return;

    const messageText = input.trim() || (attachedFiles.length > 0 ? 'Please analyze this document.' : '');
    const filesToSend = [...attachedFiles];

    // Clear drafts
    setInput('');
    setAttachedFiles([]);
    setAttachmentsPreview([]);

    sendChatMessage(messageText, filesToSend);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const quickPrompts = [
    {
      label: 'Setup my study schedule from scratch',
      icon: <Sparkles className="w-3 h-3 text-cyan-400" />,
    },
    {
      label: "I'm too tired to study today. Push my tasks.",
      icon: <Zap className="w-3 h-3 text-amber-400" />,
    },
    {
      label: 'What should I study next?',
      icon: <Flame className="w-3 h-3 text-rose-400" />,
    },
    {
      label: 'Show my remaining exam runway',
      icon: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
    },
    {
      label: 'How much available study time do I have this week?',
      icon: <FileCheck className="w-3 h-3 text-blue-400" />,
    },
  ];

  return (
    <GlassCard
      variant="default"
      rounded="lg"
      className={`relative flex flex-col ${
        fullHeight ? 'h-[calc(100vh-140px)] min-h-[550px]' : 'h-[500px]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-dark-900/90 border-2 border-dashed border-cyan-400/80 rounded-2xl backdrop-blur-sm animate-fadeIn">
          <UploadCloud className="w-12 h-12 text-cyan-400 animate-bounce mb-3" />
          <h4 className="text-base font-bold text-white">Drop timetable or syllabus here</h4>
          <p className="text-xs text-slate-400 mt-1">Supports images (JPG, PNG, WebP) and PDF</p>
        </div>
      )}

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
                Vision & Adaptive Agent
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-medium">● OpenRouter AI Connected</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Multimodal Engine</span>
          <span className="text-cyan-400">Vision + Tool Grounding</span>
        </div>
      </div>

      {/* Chat Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isAiThinking && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-850/60 border border-cyan-500/20 text-cyan-300 text-xs animate-pulse max-w-md">
            <Bot className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
            <span>
              {attachedFiles.length > 0
                ? 'Processing document with Vision Model & extracting academic structure...'
                : 'Consulting backend schedule, exam runway, and adaptive policies...'}
            </span>
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

      {/* Attachment Draft Preview Strip */}
      {attachmentsPreview.length > 0 && (
        <div className="px-4 py-2.5 bg-dark-950/70 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Attached:</span>
          {attachmentsPreview.map((att, idx) => (
            <ImageAttachment
              key={att.id}
              attachment={att}
              onRemove={() => handleRemoveFile(idx)}
              interactive={false}
            />
          ))}
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 border-t border-white/[0.08] bg-dark-900/60 relative"
      >
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="relative flex items-center gap-2">
          {/* File Upload Button */}
          <button
            type="button"
            disabled={isAiThinking}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors disabled:opacity-40 shrink-0"
            title="Attach timetable, exam datesheet, or syllabus image"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            disabled={isAiThinking}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isAiThinking
                ? 'AI is analyzing & executing...'
                : attachedFiles.length > 0
                ? 'Add instructions for uploaded document (or hit send to auto-analyze)...'
                : 'Ask Studyvault or upload timetable / syllabus images...'
            }
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-dark-950/80 text-white placeholder-slate-500 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && attachedFiles.length === 0) || isAiThinking}
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
