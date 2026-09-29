import React, { useState, useEffect } from 'react';
import { CasinoGameTab } from './casinoTypes';
import { SlotMachine } from './SlotMachine';
import { RouletteWheel } from './RouletteWheel';
import { casinoAudio } from './casinoAudio';
import {
  X,
  Volume2,
  VolumeX,
  Coins,
  Sparkles,
  Trophy,
  Flame,
  PlusCircle,
} from 'lucide-react';

interface CasinoVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CasinoVaultModal: React.FC<CasinoVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CasinoGameTab>('slots');
  const [chips, setChips] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('studyvault_casino_chips');
      if (saved !== null) {
        const val = parseInt(saved, 10);
        return isNaN(val) ? 1000 : val;
      }
    } catch {}
    return 1000;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => casinoAudio.getMuted());
  const [screenShake, setScreenShake] = useState(false);
  const [jackpotBanner, setJackpotBanner] = useState<string | null>(null);

  // Synchronize chips to localStorage
  const handleUpdateChips = (newTotal: number) => {
    setChips(newTotal);
    try {
      localStorage.setItem('studyvault_casino_chips', String(newTotal));
    } catch {}
  };

  // Free refill if user runs dry
  const handleRefillChips = () => {
    const refill = chips + 500;
    handleUpdateChips(refill);
    casinoAudio.playChipBet();
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    const muted = casinoAudio.toggleMute();
    setIsMuted(muted);
  };

  // Handle Jackpot Celebration
  const handleJackpot = (payout: number) => {
    setScreenShake(true);
    setJackpotBanner(`MEGA JACKPOT! +${payout.toLocaleString()} CHIPS!`);

    setTimeout(() => {
      setScreenShake(false);
    }, 1200);

    setTimeout(() => {
      setJackpotBanner(null);
    }, 6000);
  };

  // ESC Key listener to close vault
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      {/* Dark Vignette & Neon Red Ambient Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 25%, rgba(133, 6, 6, 0.35) 0%, rgba(8, 8, 10, 0.98) 75%)',
        }}
      />

      {/* Screen Shake Container */}
      <div 
        className={`relative z-10 w-full max-w-4xl min-h-[90vh] my-auto flex flex-col rounded-3xl border-2 border-red-700/60 shadow-[0_0_60px_rgba(220,38,38,0.45)] overflow-hidden transition-transform ${
          screenShake ? 'animate-shake' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, #0e0e12 0%, #08080a 60%, #050507 100%)',
        }}
      >
        {/* Top Metallic Bevel Header */}
        <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 border-b border-red-900/60 bg-gradient-to-r from-red-950/80 via-black to-red-950/80 backdrop-blur-md">
          {/* Logo & Secret Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-red-800 to-black border-2 border-amber-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-yellow-500">
                  CASINO VAULT
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/50">
                  SECRET ACCESS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Noir High-Roller Suite</p>
            </div>
          </div>

          {/* Chips Counter & Refill */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              <Coins className="w-4 h-4 text-amber-400 animate-spin" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-amber-400/80 leading-none">Study Chips</span>
                <span className="text-sm font-mono font-black text-amber-300 leading-tight">
                  {chips.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Refill Button if low */}
            {chips < 100 && (
              <button
                type="button"
                onClick={handleRefillChips}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                title="Claim 500 Free Chips"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+500 Chips</span>
              </button>
            )}

            {/* Audio Mute/Unmute */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-zinc-700 shadow-sm cursor-pointer transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-300 hover:text-white border border-red-700 shadow-[0_0_10px_rgba(220,38,38,0.5)] cursor-pointer transition-colors"
              title="Exit Vault (ESC)"
              aria-label="Close Casino Vault"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Mega Jackpot Marquee Announcement */}
        {jackpotBanner && (
          <div className="relative py-2.5 px-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-black text-center font-black text-sm sm:text-base tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pulse flex items-center justify-center gap-3">
            <Trophy className="w-5 h-5 text-black" />
            <span>{jackpotBanner}</span>
            <Trophy className="w-5 h-5 text-black" />
          </div>
        )}

        {/* Game Switcher Tabs: Vault Slots vs Neon Roulette */}
        <div className="flex items-center justify-center p-3 border-b border-zinc-800/80 bg-black/40">
          <div className="flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-red-900/40 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('slots');
                casinoAudio.playChipBet();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'slots'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.7)] border border-amber-300/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Vault Slots</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('roulette');
                casinoAudio.playChipBet();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'roulette'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.7)] border border-amber-300/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Neon Roulette</span>
            </button>
          </div>
        </div>

        {/* Game Area Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {activeTab === 'slots' ? (
            <SlotMachine
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onJackpot={handleJackpot}
            />
          ) : (
            <RouletteWheel
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onJackpot={handleJackpot}
            />
          )}
        </div>

        {/* Bottom Status / Footer Bar */}
        <div className="px-6 py-3 border-t border-zinc-900 bg-black/60 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>SECRET VAULT PROTOCOL • FAIR PLAY RNG</span>
          </div>
          <div>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">ESC</kbd> to return to study</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px) rotate(1deg); }
          60% { transform: translateX(-5px) rotate(-0.5deg); }
          80% { transform: translateX(5px) rotate(0.5deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CasinoVaultModal;
