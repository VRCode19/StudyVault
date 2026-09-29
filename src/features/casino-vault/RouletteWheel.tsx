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
  const [ballRadius, setBallRadius] = useState<number>(148);

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
    
    // To align pocket randomIndex with the ball at top (0 deg):
    // Final wheel angle mod 360 must equal (360 - (randomIndex * pocketDegrees) % 360) % 360
    const targetWheelMod = (360 - ((randomIndex * pocketDegrees) % 360)) % 360;
    const currentWheelMod = ((wheelAngle % 360) + 360) % 360;
    const forwardWheelDelta = (targetWheelMod - currentWheelMod + 360) % 360;
    const wheelSpins = 360 * 6 + forwardWheelDelta;

    // Ball spins counter-clockwise and ends at top (0 deg):
    const currentBallMod = ((ballAngle % 360) + 360) % 360;
    const backwardBallDelta = (currentBallMod + 360) % 360;
    const ballSpins = 360 * 8 + backwardBallDelta;

    setWheelAngle((prev) => prev + wheelSpins);
    setBallAngle((prev) => prev - ballSpins);
    setBallRadius(148);

    // Marble click track sound simulation
    let clickDelay = 55;
    let clickCount = 0;
    const playNextBallClick = () => {
      if (clickCount > 28) return;
      casinoAudio.playBallClick(Math.max(0.04, 0.16 - clickCount * 0.005));
      clickCount++;
      clickDelay = Math.floor(clickDelay * 1.09);
      ballSoundIntervalRef.current = window.setTimeout(playNextBallClick, clickDelay);
    };
    playNextBallClick();

    // After 3.1s, the ball decays inward from the outer wall into the numbered pocket track
    setTimeout(() => {
      setBallRadius(123);
      casinoAudio.playBallPocketDrop();
    }, 3100);

    // Wheel stops after 4.2 seconds
    setTimeout(() => {
      if (ballSoundIntervalRef.current) clearTimeout(ballSoundIntervalRef.current);

      setWinningPocket(targetPocket);
      setIsSpinning(false);

      // Evaluate bets against targetPocket
      evaluateRouletteResult(targetPocket, bets, remainingBalance);
    }, 4200);
  }, [isSpinning, bets, chips, totalBetAmount, onUpdateChips, wheelAngle, ballAngle]);

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

  // Geometry calculations for all 37 pockets on the SVG wheel
  const POCKET_DEGREES = 360 / ROULETTE_NUMBERS.length;
  const HALF_STEP_RAD = (POCKET_DEGREES / 2) * (Math.PI / 180);
  const R_OUTER = 145;
  const R_INNER = 101;
  const R_TEXT = 123;

  const x2a = (-R_OUTER * Math.sin(HALF_STEP_RAD)).toFixed(2);
  const y2a = (-R_OUTER * Math.cos(HALF_STEP_RAD)).toFixed(2);
  const x2b = (R_OUTER * Math.sin(HALF_STEP_RAD)).toFixed(2);
  const y2b = (-R_OUTER * Math.cos(HALF_STEP_RAD)).toFixed(2);

  const x1b = (R_INNER * Math.sin(HALF_STEP_RAD)).toFixed(2);
  const y1b = (-R_INNER * Math.cos(HALF_STEP_RAD)).toFixed(2);
  const x1a = (-R_INNER * Math.sin(HALF_STEP_RAD)).toFixed(2);
  const y1a = (-R_INNER * Math.cos(HALF_STEP_RAD)).toFixed(2);

  const POCKET_PATH = `M ${x1a} ${y1a} L ${x2a} ${y2a} A ${R_OUTER} ${R_OUTER} 0 0 1 ${x2b} ${y2b} L ${x1b} ${y1b} A ${R_INNER} ${R_INNER} 0 0 0 ${x1a} ${y1a} Z`;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none py-2 px-2">
      {/* 3D Perspective Roulette Wheel Container */}
      <div className="relative flex flex-col items-center justify-center mb-6">
        {/* Outer Heavy Brass/Wood Casino Bezel */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center rounded-full p-2 bg-gradient-to-b from-amber-700 via-amber-950 to-zinc-950 border-4 border-amber-600/80 shadow-[0_15px_45px_rgba(0,0,0,0.95),0_0_35px_rgba(220,38,38,0.4)]">
          {/* Outer Dark Chrome Ball Track Basin */}
          <div className="relative w-full h-full rounded-full border-4 border-zinc-900 bg-[#060608] shadow-inner flex items-center justify-center overflow-hidden">
            {/* Rotating SVG European Wheel */}
            <div
              className="relative w-[92%] h-[92%] rounded-full shadow-2xl flex items-center justify-center transition-transform duration-[4200ms] ease-out"
              style={{
                transform: `rotate(${wheelAngle}deg)`,
              }}
            >
              <svg viewBox="-165 -165 330 330" className="w-full h-full drop-shadow-2xl">
                <defs>
                  {/* Brass Turret Gradient */}
                  <radialGradient id="brassTurret" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="45%" stopColor="#f59e0b" />
                    <stop offset="85%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>

                  {/* Inner Dish Bowl Gradient */}
                  <radialGradient id="dishBowl" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="50%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                  </radialGradient>

                  {/* Chrome Handle Gradient */}
                  <linearGradient id="chromeHandle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>

                {/* Outer Wheel Track Ring */}
                <circle r="158" fill="#121216" stroke="#27272a" strokeWidth="2" />
                <circle r="146" fill="#09090b" stroke="#d97706" strokeWidth="1.5" />

                {/* All 37 European Roulette Number Pockets */}
                {ROULETTE_NUMBERS.map((pocket, idx) => {
                  const angle = idx * POCKET_DEGREES;
                  const isWinner = winningPocket?.number === pocket.number;

                  return (
                    <g key={pocket.number} transform={`rotate(${angle})`}>
                      {/* Pocket Background Wedge */}
                      <path
                        d={POCKET_PATH}
                        fill={
                          isWinner
                            ? '#fbbf24'
                            : pocket.color === 'green'
                            ? '#15803d'
                            : pocket.color === 'red'
                            ? '#991b1b'
                            : '#18181b'
                        }
                        stroke={isWinner ? '#f59e0b' : '#cbd5e1'}
                        strokeWidth={isWinner ? 2.5 : 0.75}
                      />

                      {/* Pocket Number Label */}
                      <text
                        x="0"
                        y={-R_TEXT}
                        fill={isWinner ? '#000000' : '#ffffff'}
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="monospace, sans-serif"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {pocket.number}
                      </text>
                    </g>
                  );
                })}

                {/* Inner Separator Ring */}
                <circle r="101" fill="none" stroke="#d97706" strokeWidth="1.5" />

                {/* Center Recessed Dish Bowl */}
                <circle r="100" fill="url(#dishBowl)" />

                {/* 8 Metallic Deflector Frets */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                  <g key={ang} transform={`rotate(${ang})`}>
                    <polygon
                      points="0,-76 3,-70 0,-64 -3,-70"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="0.5"
                    />
                  </g>
                ))}

                {/* Center Brass Turret Spindle */}
                <circle r="44" fill="url(#brassTurret)" stroke="#fbbf24" strokeWidth="1.5" />

                {/* 4-Spoke Chrome Cross Handle */}
                <rect x="-35" y="-3.5" width="70" height="7" rx="3.5" fill="url(#chromeHandle)" stroke="#475569" strokeWidth="0.5" />
                <rect x="-3.5" y="-35" width="7" height="70" rx="3.5" fill="url(#chromeHandle)" stroke="#475569" strokeWidth="0.5" />

                {/* Center Ruby Jewel Cap */}
                <circle r="10" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
                <circle r="4" fill="#f87171" />
              </svg>
            </div>

            {/* Reverse-Spinning Polished Chrome Roulette Ball */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-[4200ms] ease-out"
              style={{
                transform: `rotate(${ballAngle}deg)`,
              }}
            >
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/95 shadow-[0_0_10px_#ffffff,0_2px_4px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out"
                style={{
                  transform: `translateY(-${ballRadius}px)`,
                  background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 50%, #64748b 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Winning Number Announcement Banner */}
        {winningPocket && (
          <div className="mt-3 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/90 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce">
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
