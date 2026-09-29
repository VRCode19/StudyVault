import confetti from 'canvas-confetti';

/**
 * Triggers multi-tiered casino celebration effects using canvas-confetti.
 * Gold coins, neon ruby sparks, and glitter streamers.
 */
export const triggerJackpotConfetti = () => {
  // Blast 1: Center gold coins explosion
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.55 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#fef08a'],
    shapes: ['circle'],
    scalar: 1.3,
    ticks: 240,
    zIndex: 9999,
  });

  // Blast 2: Ruby crimson & neon sparks from left & right
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#ef4444', '#dc2626', '#991b1b', '#f43f5e'],
      zIndex: 9999,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#ef4444', '#dc2626', '#991b1b', '#f43f5e'],
      zIndex: 9999,
    });
  }, 180);

  // Blast 3: Sparkling streamers rain from the top
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 120,
      origin: { y: 0.15 },
      colors: ['#ffd700', '#ff0033', '#ffffff', '#e2e8f0'],
      shapes: ['square', 'circle'],
      scalar: 1.1,
      drift: 0.5,
      gravity: 0.8,
      zIndex: 9999,
    });
  }, 350);
};

export const triggerStandardWinConfetti = () => {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#ef4444', '#38bdf8'],
    scalar: 1.0,
    zIndex: 9999,
  });
};
