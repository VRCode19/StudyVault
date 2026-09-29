import { useState, useEffect, useRef, useCallback } from 'react';
import { casinoAudio } from './casinoAudio';

export const useCasinoTrigger = () => {
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);

  // Buffer for tracking keystrokes ('7', '7', '7')
  const keySequenceRef = useRef<string[]>([]);
  const lastKeyTimeRef = useRef<number>(0);

  // Counter for logo clicks (7 times within 4 seconds)
  const logoClicksRef = useRef<number[]>([]);

  // Trigger the entrance glitch and open the vault
  const triggerUnlock = useCallback(() => {
    casinoAudio.playGlitchIntro();
    setIsGlitchActive(true);
  }, []);

  const handleGlitchComplete = useCallback(() => {
    setIsGlitchActive(false);
    setIsCasinoOpen(true);
  }, []);

  const closeCasino = useCallback(() => {
    setIsCasinoOpen(false);
  }, []);

  // Method 1: Interactive Secret - Navbar Logo 7 consecutive clicks in 4 seconds
  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    // Keep only clicks within the last 4000ms
    const recentClicks = [...logoClicksRef.current.filter((t) => now - t < 4000), now];
    logoClicksRef.current = recentClicks;

    if (recentClicks.length >= 7) {
      logoClicksRef.current = [];
      triggerUnlock();
    }
  }, [triggerUnlock]);

  // Method 2: Typing '777' or pressing Ctrl+Shift+7 / Cmd+Shift+7
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl + Shift + 7 or Cmd + Shift + 7
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '7' || e.code === 'Digit7' || e.code === 'Numpad7')) {
        e.preventDefault();
        triggerUnlock();
        return;
      }

      // If user is actively typing in an input/textarea/editable, don't trigger on bare '777'
      const activeElem = document.activeElement;
      const isInput =
        activeElem instanceof HTMLInputElement ||
        activeElem instanceof HTMLTextAreaElement ||
        activeElem?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      const now = Date.now();
      if (now - lastKeyTimeRef.current > 1500) {
        keySequenceRef.current = [];
      }
      lastKeyTimeRef.current = now;

      if (e.key === '7' || e.code === 'Digit7' || e.code === 'Numpad7') {
        keySequenceRef.current.push('7');
        if (keySequenceRef.current.length >= 3) {
          keySequenceRef.current = [];
          triggerUnlock();
        }
      } else {
        keySequenceRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerUnlock]);

  return {
    isGlitchActive,
    isCasinoOpen,
    handleGlitchComplete,
    closeCasino,
    handleLogoClick,
    triggerUnlock,
  };
};
