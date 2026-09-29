/**
 * Procedural Web Audio API sound synthesizer for StudyVault Casino Easter Egg.
 * Zero external audio files or network dependencies.
 */

class CasinoAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved mute preference
    try {
      this.isMuted = localStorage.getItem('studyvault_casino_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('studyvault_casino_muted', String(muted));
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Mechanical lever pull: heavy clunk + ratchet spring sound
   */
  public playLeverPull(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Heavy low-end mechanical clunk
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      // Ratchet clicks
      for (let i = 0; i < 4; i++) {
        const clickTime = now + 0.05 + i * 0.04;
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(800 + i * 150, clickTime);

        clickGain.gain.setValueAtTime(0.12, clickTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(clickTime);
        clickOsc.stop(clickTime + 0.03);
      }
    } catch {}
  }

  /**
   * Reel rapid tick (played repeatedly during spin deceleration)
   */
  public playReelTick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  /**
   * Metallic brake snap when a reel stops
   */
  public playReelStop(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

      // Higher metallic chime ring
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1480, now);
      chimeGain.gain.setValueAtTime(0.12, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now);
      chime.stop(now + 0.2);
    } catch {}
  }

  /**
   * Roulette ball marble rattle click along the track
   */
  public playBallClick(intensity: number = 0.1): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.02);

      gain.gain.setValueAtTime(Math.min(intensity, 0.18), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  /**
   * Roulette ball landing and bouncing into pocket
   */
  public playBallPocketDrop(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.06, 0.11, 0.15].forEach((delay, idx) => {
        const t = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750 - idx * 100, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.04);

        gain.gain.setValueAtTime(0.25 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      });
    } catch {}
  }

  /**
   * Tactile chip bet placing click
   */
  public playChipBet(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Standard win payout chimes (ascending upbeat notes)
   */
  public playWinChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {}
  }

  /**
   * Upbeat synth / 8-bit Mega Jackpot fanfare chimes
   */
  public playJackpotFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Rapid energetic fanfare sequence
      const melody = [
        { f: 523.25, d: 0.1 },  // C5
        { f: 659.25, d: 0.1 },  // E5
        { f: 783.99, d: 0.1 },  // G5
        { f: 1046.5, d: 0.15 }, // C6
        { f: 880.0, d: 0.1 },   // A5
        { f: 1046.5, d: 0.1 },  // C6
        { f: 1318.5, d: 0.4 },  // E6
      ];

      let elapsed = 0;
      melody.forEach((note) => {
        const t = now + elapsed;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + note.d * 1.6);

        elapsed += note.d;
      });
    } catch {}
  }

  /**
   * Glitch trigger entrance whoosh/hum
   */
  public playGlitchIntro(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.6);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch {}
  }
}

export const casinoAudio = new CasinoAudioEngine();
