import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ROULETTE_NUMBERS,
  RoulettePocket,
  RouletteBet,
  RouletteBetType,
  BET_AMOUNTS,
} from './casinoTypes';
import { casinoAudio } from './casinoAudio';
import { triggerJackpotConfetti, triggerStandardWinConfetti } from './casinoConfetti';
import { Sparkles, Coins, RotateCcw, Flame } from 'lucide-react';

interface RouletteWheelProps {
  chips: number;
  onUpdateChips: (newTotal: number) => void;
  onJackpot: (payout: number) => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  chips,
  onUpdateChips,
  onJackpot,
}) => {
  const [selectedChipValue, setSelectedChipValue] = useState<number>(50);
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  // Wheel and ball continuous rotation angles (in degrees)
  const [wheelAngle, setWheelAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);

  // Result state
  const [winningPocket, setWinningPocket] = useState<RoulettePocket | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('PLACE YOUR BETS ON THE FELT');
  const [isSingleNumberJackpot, setIsSingleNumberJackpot] = useState(false);

  // Sound click interval for marble
  const ballSoundIntervalRef = useRef<number | null>(null);

  // Total amount currently bet
  const totalBetAmount = bets.reduce((sum, b) => sum + b.amount, 0);

  // Add a bet to the board
  const placeBet = (type: RouletteBetType, value?: number) => {
    if (isSpinning) return;

    if (chips < totalBetAmount + selectedChipValue) {
      setStatusMessage('NOT ENOUGH CHIPS FOR THIS BET!');
      return;
    }

    casinoAudio.playChipBet();
    setBets((prev) => {
      // If same bet exists, increment amount
      const existingIdx = prev.findIndex(
        (b) => b.type === type && (type !== 'number' || b.value === value)
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          amount: updated[existingIdx].amount + selectedChipValue,
        };
        return updated;
      }

      return [...prev, { type, value, amount: selectedChipValue }];
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    setBets([]);
    setStatusMessage('BETS CLEARED. PLACE YOUR CHIPS.');
  };

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    if (bets.length === 0) {
      setStatusMessage('PLACE AT LEAST ONE BET TO SPIN!');
      return;
    }
    if (chips < totalBetAmount) {
      setStatusMessage('INSUFFICIENT CHIPS!');
      return;
    }

    // Deduct bet from balance
    const currentBetTotal = totalBetAmount;
    const remainingBalance = chips - currentBetTotal;
    onUpdateChips(remainingBalance);

    setIsSpinning(true);
    setWinningPocket(null);
    setLastWinAmount(0);
    setIsSingleNumberJackpot(false);
    setStatusMessage('BALL ROLLING... NO MORE BETS!');

    // Random winning pocket chosen
    const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const targetPocket = ROULETTE_NUMBERS[randomIndex];

    // Pocket angle (each pocket is 360 / 37 ≈ 9.7297 degrees)
    const pocketDegrees = 360 / ROULETTE_NUMBERS.length;
    const targetWheelOffset = randomIndex * pocketDegrees;

    // Wheel spins clockwise 5-7 full turns
    const wheelSpins = 360 * 6 + targetWheelOffset;
    // Ball spins counter-clockwise (reverse) 8-10 full turns
    const ballSpins = -360 * 9;

    setWheelAngle((prev) => prev + wheelSpins);
    setBallAngle((prev) => prev + ballSpins);

    // Marble click track sound simulation
    let clickDelay = 60;
    let clickCount = 0;
    const playNextBallClick = () => {
      if (clickCount > 28) return;
      casinoAudio.playBallClick(Math.max(0.04, 0.16 - clickCount * 0.005));
      clickCount++;
      clickDelay = Math.floor(clickDelay * 1.09);
      ballSoundIntervalRef.current = window.setTimeout(playNextBallClick, clickDelay);
    };
    playNextBallClick();

    // Wheel stops after 4.2 seconds
    setTimeout(() => {
      if (ballSoundIntervalRef.current) clearTimeout(ballSoundIntervalRef.current);
      casinoAudio.playBallPocketDrop();

      setWinningPocket(targetPocket);
      setIsSpinning(false);

      // Evaluate bets against targetPocket
      evaluateRouletteResult(targetPocket, bets, remainingBalance);
    }, 4200);
  }, [isSpinning, bets, chips, totalBetAmount, onUpdateChips]);

  const evaluateRouletteResult = (
    winPocket: RoulettePocket,
    placedBets: RouletteBet[],
    baseChips: number
  ) => {
    let totalPayout = 0;
    let directHit = false;

    placedBets.forEach((bet) => {
      let won = false;
      let multiplier = 0;

      if (bet.type === 'number' && bet.value === winPocket.number) {
        won = true;
        multiplier = 36; // 36x for direct single number
        directHit = true;
      } else if (winPocket.number !== 0) {
        if (bet.type === 'red' && winPocket.color === 'red') {
          won = true;
          multiplier = 2;
        } else if (bet.type === 'black' && winPocket.color === 'black') {
          won = true;
          multiplier = 2;
        } else if (bet.type === 'even' && winPocket.number % 2 === 0) {
          won = true;
          multiplier = 2;
        } else if (bet.type === 'odd' && winPocket.number % 2 === 1) {
          won = true;
          multiplier = 2;
        } else if (bet.type === 'low' && winPocket.number >= 1 && winPocket.number <= 18) {
          won = true;
          multiplier = 2;
        } else if (bet.type === 'high' && winPocket.number >= 19 && winPocket.number <= 36) {
          won = true;
          multiplier = 2;
        }
      }

      if (won) {
        totalPayout += bet.amount * multiplier;
      }
    });

    setLastWinAmount(totalPayout);

    if (totalPayout > 0) {
      const newTotal = baseChips + totalPayout;
      onUpdateChips(newTotal);

      if (directHit) {
        setIsSingleNumberJackpot(true);
        setStatusMessage(
          `🔥 DIRECT NUMBER HIT ON ${winPocket.number} (${winPocket.color.toUpperCase()})! MEGA PAYOUT +${totalPayout.toLocaleString()} CHIPS! 🔥`
        );
        triggerJackpotConfetti();
        casinoAudio.playJackpotFanfare();
        onJackpot(totalPayout);
      } else {
        setStatusMessage(
          `WINNER! NUMBER ${winPocket.number} (${winPocket.color.toUpperCase()}). WON +${totalPayout.toLocaleString()} CHIPS!`
        );
        triggerStandardWinConfetti();
        casinoAudio.playWinChime();
      }
    } else {
      setStatusMessage(
        `LANDED ON ${winPocket.number} ${winPocket.color.toUpperCase()}. NO WINNING BETS THIS ROUND.`
      );
    }
  };

  useEffect(() => {
    return () => {
      if (ballSoundIntervalRef.current) clearTimeout(ballSoundIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none py-2 px-2">
      {/* 3D Perspective Roulette Wheel Container */}
      <div className="relative flex flex-col items-center justify-center mb-6">
        {/* Outer Neon Glow Ring */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center rounded-full p-2.5 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border-4 border-amber-600/70 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_30px_rgba(220,38,38,0.4)]">
          {/* Outer Chrome Ball Track */}
          <div className="relative w-full h-full rounded-full border-4 border-zinc-800 bg-[#070709] shadow-inner flex items-center justify-center overflow-hidden">
            {/* Spinning Wheel */}
            <div
              className="relative w-[90%] h-[90%] rounded-full shadow-2xl flex items-center justify-center transition-transform duration-[4200ms] ease-out"
              style={{
                transform: `rotate(${wheelAngle}deg)`,
                background: 'conic-gradient(#18181b 0deg 9.7deg, #991b1b 9.7deg 19.4deg, #18181b 19.4deg 29.1deg, #991b1b 29.1deg 38.8deg, #18181b 38.8deg 48.5deg, #991b1b 48.5deg 58.2deg, #18181b 58.2deg 67.9deg, #991b1b 67.9deg 77.6deg, #18181b 77.6deg 87.3deg, #991b1b 87.3deg 97deg, #18181b 97deg 106.7deg, #991b1b 106.7deg 116.4deg, #18181b 116.4deg 126.1deg, #991b1b 126.1deg 135.8deg, #18181b 135.8deg 145.5deg, #991b1b 145.5deg 155.2deg, #18181b 155.2deg 164.9deg, #991b1b 164.9deg 174.6deg, #18181b 174.6deg 184.3deg, #991b1b 184.3deg 194deg, #18181b 194deg 203.7deg, #991b1b 203.7deg 213.4deg, #18181b 213.4deg 223.1deg, #991b1b 223.1deg 232.8deg, #18181b 232.8deg 242.5deg, #991b1b 242.5deg 252.2deg, #18181b 252.2deg 261.9deg, #991b1b 261.9deg 271.6deg, #18181b 271.6deg 281.3deg, #991b1b 281.3deg 291deg, #18181b 291deg 300.7deg, #991b1b 300.7deg 310.4deg, #18181b 310.4deg 320.1deg, #991b1b 320.1deg 329.8deg, #18181b 329.8deg 339.5deg, #991b1b 339.5deg 349.2deg, #15803d 349.2deg 360deg)',
              }}
            >
              {/* Pocket dividers & subtle radial gradient overlay */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 opacity-70" />

              {/* Center Turret (Brass & Chrome Conical Cone) */}
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center z-10"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #d97706 60%, #78350f 100%)',
                }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-300 via-white to-zinc-400 border border-zinc-500 shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_6px_#ef4444]" />
                </div>
              </div>
            </div>

            {/* Reverse-Spinning Polished Chrome Roulette Ball */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-[4200ms] ease-out"
              style={{
                transform: `rotate(${ballAngle}deg)`,
              }}
            >
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/80 shadow-[0_0_8px_#ffffff,0_2px_4px_rgba(0,0,0,0.9)]"
                style={{
                  transform: 'translateY(-110px) sm:translateY(-135px)',
                  background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Winning Number Announcement Banner */}
        {winningPocket && (
          <div className="mt-3 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/90 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-bounce">
            <span
              className={`w-4 h-4 rounded-full ${
                winningPocket.color === 'green'
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : winningPocket.color === 'red'
                  ? 'bg-red-600 shadow-[0_0_8px_#ef4444]'
                  : 'bg-zinc-800 border border-zinc-500 shadow-[0_0_8px_#71717a]'
              }`}
            />
            <span className="text-sm font-black text-white font-mono">
              RESULT: {winningPocket.number} ({winningPocket.color.toUpperCase()})
            </span>
          </div>
        )}
      </div>

      {/* Digital Status Screen */}
      <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-black border border-red-900/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] text-center">
        <p
          className={`font-mono font-bold text-xs sm:text-sm tracking-wider ${
            isSingleNumberJackpot
              ? 'text-yellow-400 animate-pulse text-base'
              : lastWinAmount > 0
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          {statusMessage}
        </p>
      </div>

      {/* Interactive Casino Noir Betting Board (Felt Table) */}
      <div className="w-full max-w-2xl rounded-2xl p-4 sm:p-5 border-2 border-red-800/70 bg-[#09090b] shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] mb-5">
        {/* Chips Selector & Bet Overview */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Chip:
            </span>
            <div className="flex items-center gap-1.5">
              {BET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedChipValue(amt);
                    casinoAudio.playChipBet();
                  }}
                  className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                    selectedChipValue === amt
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-2 border-amber-300 shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110'
                      : 'bg-zinc-800 text-slate-300 hover:text-white border border-zinc-600'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Current Bet Counter & Clear */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bet</span>
              <span className="text-sm font-mono font-bold text-amber-300">{totalBetAmount} Chips</span>
            </div>
            <button
              type="button"
              onClick={clearBets}
              disabled={isSpinning || bets.length === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Outside Bets (Red, Black, Even, Odd, Low, High) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
          <button
            type="button"
            onClick={() => placeBet('red')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider border border-red-500 shadow-md cursor-pointer transition-all active:scale-95"
          >
            RED (2x)
          </button>
          <button
            type="button"
            onClick={() => placeBet('black')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs tracking-wider border border-zinc-600 shadow-md cursor-pointer transition-all active:scale-95"
          >
            BLACK (2x)
          </button>
          <button
            type="button"
            onClick={() => placeBet('even')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-extrabold text-xs tracking-wider border border-zinc-600 shadow-md cursor-pointer transition-all active:scale-95"
          >
            EVEN (2x)
          </button>
          <button
            type="button"
            onClick={() => placeBet('odd')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-extrabold text-xs tracking-wider border border-zinc-600 shadow-md cursor-pointer transition-all active:scale-95"
          >
            ODD (2x)
          </button>
          <button
            type="button"
            onClick={() => placeBet('low')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-extrabold text-xs tracking-wider border border-zinc-600 shadow-md cursor-pointer transition-all active:scale-95"
          >
            1 - 18
          </button>
          <button
            type="button"
            onClick={() => placeBet('high')}
            disabled={isSpinning}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-extrabold text-xs tracking-wider border border-zinc-600 shadow-md cursor-pointer transition-all active:scale-95"
          >
            19 - 36
          </button>
        </div>

        {/* 0 Green Pocket + Number Matrix (1 to 36) */}
        <div className="space-y-1.5">
          {/* Zero pocket */}
          <button
            type="button"
            onClick={() => placeBet('number', 0)}
            disabled={isSpinning}
            className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-widest border border-emerald-400 shadow-sm cursor-pointer transition-all"
          >
            0 (JACKPOT 36x)
          </button>

          {/* 36 Number Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
              const pocket = ROULETTE_NUMBERS.find((p) => p.number === num);
              const isRed = pocket ? pocket.color === 'red' : false;
              const activeBet = bets.find((b) => b.type === 'number' && b.value === num);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => placeBet('number', num)}
                  disabled={isSpinning}
                  className={`relative h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isRed
                      ? 'bg-red-800 hover:bg-red-700 text-white border border-red-500'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-slate-200 border border-zinc-700'
                  } ${activeBet ? 'ring-2 ring-amber-400 shadow-[0_0_8px_#fbbf24]' : ''}`}
                >
                  {num}
                  {activeBet && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Spin Roulette Button */}
        <div className="mt-5">
          <button
            type="button"
            id="roulette-spin-btn"
            onClick={handleSpin}
            disabled={isSpinning || bets.length === 0}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg tracking-widest uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(220,38,38,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)] ${
              isSpinning
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 hover:from-red-400 hover:to-red-700 text-white border-2 border-red-400/80 active:translate-y-1 active:shadow-none'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>{isSpinning ? 'BALL ROLLING...' : `SPIN ROULETTE (${totalBetAmount} CHIPS)`}</span>
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};
