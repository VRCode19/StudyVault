import React from 'react';
import { CheckCircle2, Sparkles, AlertCircle, Info, X } from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStudyVault();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          adaptive: <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-500/30 shadow-emerald-950/40',
          adaptive: 'border-cyan-500/40 shadow-cyan-950/50',
          warning: 'border-amber-500/30 shadow-amber-950/40',
          info: 'border-blue-500/30 shadow-blue-950/40',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-card-sm bg-dark-850/90 backdrop-blur-xl border ${borderStyles[toast.type]} shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.02]`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
