import React, { useEffect, useState } from 'react';

interface CasinoGlitchEffectProps {
  active: boolean;
  onComplete: () => void;
}

export const CasinoGlitchEffect: React.FC<CasinoGlitchEffectProps> = ({ active, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Red pulse strobe flash */}
      <div className="absolute inset-0 bg-red-600/40 mix-blend-screen animate-pulse" />

      {/* Cyber glitch bars */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(220, 38, 38, 0.25) 0px, rgba(0, 0, 0, 0.4) 2px, transparent 4px)',
          animation: 'glitchFlicker 0.15s infinite alternate',
        }}
      />

      {/* Horizontal chromatic aberration slice */}
      <div className="absolute top-1/3 inset-x-0 h-16 bg-gradient-to-r from-red-600/60 via-transparent to-red-500/60 blur-sm transform -skew-x-12 translate-x-2" />
      <div className="absolute top-2/3 inset-x-0 h-12 bg-gradient-to-r from-black/80 via-red-700/50 to-black/80 blur-xs transform skew-x-6 -translate-x-3" />

      {/* Center Secret Unlocked Marquee Banner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 py-3 rounded-xl bg-black/90 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.9)] text-center animate-bounce">
          <p className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold">
            [ACCESS GRANTED]
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(239,68,68,1)]">
            CASINO VAULT UNLOCKED
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes glitchFlicker {
          0% { opacity: 0.6; transform: translateY(0); }
          50% { opacity: 0.9; transform: translateY(-2px); }
          100% { opacity: 0.7; transform: translateY(2px); }
        }
      `}</style>
    </div>
  );
};
