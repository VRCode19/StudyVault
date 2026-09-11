import React from 'react';

export type BadgeVariant =
  | 'adaptive'
  | 'ai-optimized'
  | 'deadline-protected'
  | 'rescheduled'
  | 'on-track'
  | 'needs-attention'
  | 'completed'
  | 'in-progress'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const configs: Record<
    BadgeVariant,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    adaptive: {
      label: 'Adaptive',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-300',
      border: 'border-cyan-500/25',
      dot: 'bg-cyan-400',
    },
    'ai-optimized': {
      label: 'AI Optimized',
      bg: 'bg-blue-500/10',
      text: 'text-blue-300',
      border: 'border-blue-500/25',
      dot: 'bg-blue-400',
    },
    'deadline-protected': {
      label: 'Deadline Protected',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/25',
      dot: 'bg-emerald-400',
    },
    rescheduled: {
      label: 'Rescheduled',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/25',
      dot: 'bg-amber-400',
    },
    'on-track': {
      label: 'On Track',
      bg: 'bg-teal-500/10',
      text: 'text-teal-300',
      border: 'border-teal-500/25',
      dot: 'bg-teal-400',
    },
    'needs-attention': {
      label: 'Needs Attention',
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/25',
      dot: 'bg-rose-400',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-200',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    'in-progress': {
      label: 'In Progress',
      bg: 'bg-blue-500/15',
      text: 'text-blue-200',
      border: 'border-blue-500/30',
      dot: 'bg-blue-400',
    },
    neutral: {
      label: 'General',
      bg: 'bg-slate-500/10',
      text: 'text-slate-300',
      border: 'border-slate-500/20',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[variant];
  const content = children || config.label;

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-mono ${config.bg} ${config.text} ${config.border} ${sizeStyles[size]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`}
      />
      <span className="font-sans normal-case tracking-normal">{content}</span>
    </span>
  );
};
