import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SLOT_SYMBOLS,
  SlotSymbolDef,
  BET_AMOUNTS,
} from './casinoTypes';
import { casinoAudio } from './casinoAudio';
import { triggerJackpotConfetti, triggerStandardWinConfetti } from './casinoConfetti';
import { Sparkles, Coins, Flame } from 'lucide-react';

interface SlotMachineProps {
  chips: number;
  onUpdateChips: (newTotal: number) => void;
  onJackpot: (payout: number) => void;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({
  chips,
  onUpdateChips,
  onJackpot,
}) => {
  const [selectedBet, setSelectedBet] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);

  // Active displayed symbols on the 3 reels
  const [reel1, setReel1] = useState<SlotSymbolDef>(SLOT_SYMBOLS[0]);
  const [reel2, setReel2] = useState<SlotSymbolDef>(SLOT_SYMBOLS[1]);
  const [reel3, setReel3] = useState<SlotSymbolDef>(SLOT_SYMBOLS[2]);

  // Spin status per reel for staggered stop animations
  const [spinningReel1, setSpinningReel1] = useState(false);
  const [spinningReel2, setSpinningReel2] = useState(false);
  const [spinningReel3, setSpinningReel3] = useState(false);

  // Win announcements
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('PRESS SPIN OR PULL LEVER');
  const [isJackpotWin, setIsJackpotWin] = useState(false);

  // Reel stop bounce animation triggers
  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);
  const [bump3, setBump3] = useState(false);

  // Interval reference for tick audio during spin
  const tickIntervalRef = useRef<number | null>(null);

  const getRandomSymbol = (): SlotSymbolDef => {
    // Weighted random selection: 7 is rarest, cherry/bell more common
    const roll = Math.random();
    if (roll < 0.10) return SLOT_SYMBOLS[0]; // 7
    if (roll < 0.22) return SLOT_SYMBOLS[1]; // Gem
    if (roll < 0.38) return SLOT_SYMBOLS[2]; // Book
    if (roll < 0.56) return SLOT_SYMBOLS[3]; // Star
    if (roll < 0.77) return SLOT_SYMBOLS[4]; // Bell
    return SLOT_SYMBOLS[5]; // Cherry
  };

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    if (chips < selectedBet) {
      setWinMessage('INSUFFICIENT CHIPS! REFILL BELOW');
      return;
    }

    // Deduct bet
    const currentBet = selectedBet;
    const remainingChips = chips - currentBet;
    onUpdateChips(remainingChips);
    setLastWin(0);
    setIsJackpotWin(false);
    setWinMessage('SPINNING THE VAULT...');

    setIsSpinning(true);
    setSpinningReel1(true);
    setSpinningReel2(true);
    setSpinningReel3(true);

    // Rapid symbol cycling for visual blur
    const cycleInterval = setInterval(() => {
      setReel1(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
      setReel2(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
      setReel3(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
    }, 70);

    // Audio ticking loop
    tickIntervalRef.current = window.setInterval(() => {
      casinoAudio.playReelTick();
    }, 110);

    // Determine final symbols ahead of time
    const target1 = getRandomSymbol();
    const target2 = getRandomSymbol();
    const target3 = getRandomSymbol();

    // 1. Reel 1 stops at 1600ms
    setTimeout(() => {
      setSpinningReel1(false);
      setReel1(target1);
      setBump1(true);
      casinoAudio.playReelStop();
      setTimeout(() => setBump1(false), 250);
    }, 1600);

    // 2. Reel 2 stops at 2300ms
    setTimeout(() => {
      setSpinningReel2(false);
      setReel2(target2);
      setBump2(true);
      casinoAudio.playReelStop();
      setTimeout(() => setBump2(false), 250);
    }, 2300);

    // 3. Reel 3 stops at 3000ms
    setTimeout(() => {
      clearInterval(cycleInterval);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

      setSpinningReel3(false);
      setReel3(target3);
      setBump3(true);
      casinoAudio.playReelStop();
      setTimeout(() => setBump3(false), 250);

      setIsSpinning(false);

      // Evaluate Win
      evaluateWin(target1, target2, target3, currentBet, remainingChips);
    }, 3000);
  }, [chips, isSpinning, selectedBet, onUpdateChips]);

  const evaluateWin = (
    s1: SlotSymbolDef,
    s2: SlotSymbolDef,
    s3: SlotSymbolDef,
    bet: number,
    baseChips: number
  ) => {
    // 3 of a kind
    if (s1.id === s2.id && s2.id === s3.id) {
      const payout = bet * s1.multiplier3x;
      const newBalance = baseChips + payout;
      setLastWin(payout);
      onUpdateChips(newBalance);

      if (s1.id === '7') {
        // MEGA JACKPOT
        setIsJackpotWin(true);
        setWinMessage(`🔥 MEGA JACKPOT! +${payout.toLocaleString()} CHIPS! 🔥`);
        triggerJackpotConfetti();
        casinoAudio.playJackpotFanfare();
        onJackpot(payout);
      } else {
        setWinMessage(`TRIPLE ${s1.label.toUpperCase()}! +${payout.toLocaleString()} CHIPS!`);
        triggerStandardWinConfetti();
        casinoAudio.playWinChime();
      }
      return;
    }

    // 2 of a kind
    let matchingSymbol: SlotSymbolDef | null = null;
    if (s1.id === s2.id || s1.id === s3.id) {
      matchingSymbol = s1;
    } else if (s2.id === s3.id) {
      matchingSymbol = s2;
    }

    if (matchingSymbol) {
      const payout = Math.round(bet * matchingSymbol.multiplier2x);
      const newBalance = baseChips + payout;
      setLastWin(payout);
      onUpdateChips(newBalance);
      setWinMessage(`DOUBLE ${matchingSymbol.label.toUpperCase()}! +${payout.toLocaleString()} CHIPS`);
      triggerStandardWinConfetti();
      casinoAudio.playWinChime();
      return;
    }

    // No match
    setLastWin(0);
    setWinMessage('NO MATCH. TRY YOUR LUCK AGAIN!');
  };

  // Mechanical lever action
  const handlePullLever = () => {
    if (isSpinning) return;
    setLeverPulled(true);
    casinoAudio.playLeverPull();

    setTimeout(() => {
      setLeverPulled(false);
      handleSpin();
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto select-none py-2 px-2">
      {/* Heavy 3D Cabinet Wrapper with Lever */}
      <div className="relative flex items-center justify-center w-full">
        {/* Main Cabinet Body */}
        <div 
          className={`relative w-full max-w-lg rounded-3xl p-5 sm:p-7 border-2 border-red-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(185,28,28,0.35)] transition-transform duration-300 ${
            isJackpotWin ? 'animate-bounce ring-4 ring-yellow-400' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #18181b 0%, #0d0d0f 40%, #08080a 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(220, 38, 38, 0.4)',
          }}
        >
          {/* Top Marquee (Curved Vintage Header with Chasing Lights) */}
          <div className="relative mb-5 px-4 py-3 rounded-2xl border-2 border-red-500/70 bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-center shadow-[inset_0_2px_8px_rgba(255,255,255,0.25),0_0_25px_rgba(239,68,68,0.5)] overflow-hidden">
            {/* Chasing Light Dots */}
            <div className="flex justify-between items-center px-2 mb-1">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    isSpinning
                      ? (i % 2 === 0 ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-red-400 shadow-[0_0_8px_#f87171]')
                      : 'bg-amber-300/80 shadow-[0_0_5px_#fbbf24]'
                  } transition-all duration-150`}
                />
              ))}
            </div>

            {/* Embossed Marquee Title */}
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                STUDY VAULT SLOTS
              </h2>
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <p className="text-[10px] font-mono font-bold tracking-widest text-red-300 uppercase mt-0.5">
              3x LUCKY 7 PAYS 100x MEGA JACKPOT
            </p>
          </div>

          {/* 3D Cylindrical Reels Stage */}
          <div 
            className="relative p-3.5 sm:p-4 rounded-2xl border-4 border-zinc-800 bg-black/90 shadow-[inset_0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(220,38,38,0.2)] mb-5"
            style={{
              background: 'radial-gradient(circle at center, #1c1917 0%, #0c0a09 100%)',
            }}
          >
            {/* Center Payout Payline Indicator Wire */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/60 shadow-[0_0_10px_#ef4444] z-20 pointer-events-none flex justify-between items-center px-1">
              <span className="w-2.5 h-2.5 -ml-1 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="w-2.5 h-2.5 -mr-1 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </div>

            {/* Specular curved glass reflection bar */}
            <div className="absolute inset-x-4 top-2 h-1/3 bg-gradient-to-b from-white/15 to-transparent rounded-t-xl z-20 pointer-events-none" />

            {/* Bottom shadow for cylinder illusion */}
            <div className="absolute inset-x-4 bottom-2 h-1/3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl z-20 pointer-events-none" />

            {/* 3 Reels Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 relative z-10">
              {/* Reel 1 */}
              <div
                className={`relative h-28 sm:h-36 rounded-xl flex items-center justify-center border-2 border-zinc-700/60 shadow-[inset_0_8px_16px_rgba(0,0,0,0.8)] overflow-hidden transition-transform ${
                  bump1 ? 'scale-105 transition-all' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, #18181b 0%, #27272a 50%, #18181b 100%)',
                }}
              >
                <div
                  className={`flex flex-col items-center justify-center transition-all ${
                    spinningReel1 ? 'blur-xs scale-95 opacity-80' : 'scale-100 opacity-100'
                  }`}
                >
                  <span
                    className="text-4xl sm:text-5xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                    style={{ color: reel1.color, textShadow: `0 0 20px ${reel1.glow}` }}
                  >
                    {reel1.glyph}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                    {reel1.label}
                  </span>
                </div>
              </div>

              {/* Reel 2 */}
              <div
                className={`relative h-28 sm:h-36 rounded-xl flex items-center justify-center border-2 border-zinc-700/60 shadow-[inset_0_8px_16px_rgba(0,0,0,0.8)] overflow-hidden transition-transform ${
                  bump2 ? 'scale-105 transition-all' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, #18181b 0%, #27272a 50%, #18181b 100%)',
                }}
              >
                <div
                  className={`flex flex-col items-center justify-center transition-all ${
                    spinningReel2 ? 'blur-xs scale-95 opacity-80' : 'scale-100 opacity-100'
                  }`}
                >
                  <span
                    className="text-4xl sm:text-5xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                    style={{ color: reel2.color, textShadow: `0 0 20px ${reel2.glow}` }}
                  >
                    {reel2.glyph}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                    {reel2.label}
                  </span>
                </div>
              </div>

              {/* Reel 3 */}
              <div
                className={`relative h-28 sm:h-36 rounded-xl flex items-center justify-center border-2 border-zinc-700/60 shadow-[inset_0_8px_16px_rgba(0,0,0,0.8)] overflow-hidden transition-transform ${
                  bump3 ? 'scale-105 transition-all' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, #18181b 0%, #27272a 50%, #18181b 100%)',
                }}
              >
                <div
                  className={`flex flex-col items-center justify-center transition-all ${
                    spinningReel3 ? 'blur-xs scale-95 opacity-80' : 'scale-100 opacity-100'
                  }`}
                >
                  <span
                    className="text-4xl sm:text-5xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                    style={{ color: reel3.color, textShadow: `0 0 20px ${reel3.glow}` }}
                  >
                    {reel3.glyph}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                    {reel3.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LED Digital Feedback Screen */}
          <div className="mb-5 p-3 rounded-xl bg-black border border-red-900/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] text-center">
            <p
              className={`font-mono font-bold text-xs sm:text-sm tracking-widest ${
                isJackpotWin
                  ? 'text-yellow-400 animate-pulse text-base'
                  : lastWin > 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {winMessage}
            </p>
            {lastWin > 0 && (
              <p className="text-yellow-400 text-xs font-mono font-bold mt-0.5">
                WINNER PAID: +{lastWin.toLocaleString()} CHIPS
              </p>
            )}
          </div>

          {/* Lower Control Deck: Bet Selector & Tactile Spin Button */}
          <div className="space-y-4">
            {/* Bet Buttons */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Bet Size:
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {BET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      if (!isSpinning) {
                        setSelectedBet(amt);
                        casinoAudio.playChipBet();
                      }
                    }}
                    disabled={isSpinning}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBet === amt
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] border border-amber-300 scale-105'
                        : 'bg-zinc-800/90 text-slate-300 hover:text-white hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {amt}
                  </button>
                ))}

                {/* MAX BET BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isSpinning) {
                      const maxBet = chips >= 500 ? 500 : (chips >= 100 ? 100 : (chips >= 50 ? 50 : 10));
                      setSelectedBet(maxBet);
                      casinoAudio.playChipBet();
                    }
                  }}
                  disabled={isSpinning}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black tracking-wider bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.6)] cursor-pointer transition-all"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Primary Big 3D Tactile Spin Button */}
            <button
              type="button"
              id="slot-spin-btn"
              onClick={handleSpin}
              disabled={isSpinning || chips < selectedBet}
              className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg tracking-widest uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(220,38,38,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)] ${
                isSpinning
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 hover:from-red-400 hover:to-red-700 text-white border-2 border-red-400/80 active:translate-y-1 active:shadow-none'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span>{isSpinning ? 'REELS ROLLING...' : `SPIN VAULT (${selectedBet} CHIPS)`}</span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </button>
          </div>
        </div>

        {/* 3D Mechanical Pull Lever (Desktop / Tablet on Right Edge) */}
        <div 
          onClick={handlePullLever}
          className="hidden md:flex flex-col items-center justify-end -ml-1 cursor-pointer group select-none relative z-30"
          style={{ height: '230px' }}
          title="Pull Lever Down to Spin!"
        >
          {/* Lever Arm & Ball Knob with straight downward pull physics */}
          <div 
            className="flex flex-col items-center transition-all"
            style={{
              transformOrigin: 'bottom center',
              transform: leverPulled 
                ? 'translateY(95px) scaleY(0.4) rotateX(65deg)' 
                : 'translateY(0px) scaleY(1) rotateX(0deg)',
              transitionTimingFunction: leverPulled 
                ? 'cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transitionDuration: leverPulled ? '180ms' : '450ms',
            }}
          >
            {/* Glossy Ruby Sphere Knob at the TOP */}
            <div 
              className="w-12 h-12 rounded-full border-2 border-red-400 shadow-[0_8px_20px_rgba(220,38,38,0.85),inset_0_4px_8px_rgba(255,255,255,0.7)] group-hover:scale-105 transition-transform"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #f87171 0%, #dc2626 50%, #7f1d1d 100%)',
              }}
            />

            {/* Polished Chrome Rod extending downward */}
            <div className="w-3.5 h-28 -mt-1 bg-gradient-to-r from-zinc-300 via-white to-zinc-400 shadow-[2px_0_6px_rgba(0,0,0,0.6)] rounded-b-sm" />
          </div>

          {/* Mechanical Brass & Chrome Axle Pivot Socket at the BOTTOM */}
          <div className="w-8 h-12 -mt-2 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 rounded-r-xl border-2 border-amber-400 shadow-[0_6px_12px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-zinc-400 via-white to-zinc-500 border border-zinc-600 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};
