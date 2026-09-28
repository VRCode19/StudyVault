import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassIconButton } from './GlassIconButton';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maxWidth?: string;
  showCloseButton?: boolean;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  maxWidth,
  showCloseButton = true,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Heavy frosted backdrop */}
      <div
        className="fixed inset-0 bg-[#07111F]/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Glass Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth || sizeClasses[size]} liquid-glass-4 rounded-panel p-6 sm:p-7 shadow-liquid-modal border border-white/20 transition-all duration-300 scale-100 opacity-100 z-10 ${className}`}
      >
        {/* Specular highlight rim */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-white/10">
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <GlassIconButton
                icon={<X className="w-4 h-4" />}
                size="sm"
                variant="subtle"
                onClick={onClose}
                label="Close modal"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-slate-200">{children}</div>
      </div>
    </div>
  );
};
