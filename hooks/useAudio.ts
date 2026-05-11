'use client';

import { useCallback, useRef } from 'react';

// Zero-latency sound synthesis using the Web Audio API.
// No .mp3 files needed — sounds are generated programmatically, meaning
// instant playback and zero network requests.
export function useAudio() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctx.current;
  }, []);

  const isMuted = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sound_disabled') === 'true';
  }, []);

  // A soft, tactile click — used for button presses & filter switches
  const playClick = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Changed from 'square' to 'sine' for a smoother, softer pulse
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, context.currentTime + 0.06);

      // Reduced gain for a subtler presence
      gainNode.gain.setValueAtTime(0.04, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.06);
    } catch {}
  }, [getCtx]);

  const playHum = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(50, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(35, context.currentTime + 0.4);

      // Reduced gain from 0.06 to 0.03
      gainNode.gain.setValueAtTime(0.03, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.4);
    } catch {}
  }, [getCtx]);

  const playSuccess = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      [660, 880].forEach((freq, i) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, context.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.03, context.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + i * 0.1 + 0.2);
        osc.start(context.currentTime + i * 0.1);
        osc.stop(context.currentTime + i * 0.1 + 0.2);
      });
    } catch {}
  }, [getCtx]);

  const playError = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      // Changed from 'sawtooth' (harsh) to 'triangle' (softer)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, context.currentTime);
      osc.frequency.linearRampToValueAtTime(80, context.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.2);
    } catch {}
  }, [getCtx]);

  const playWarp = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 2.0);
      
      // Reduced gain
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2.0);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 2.0);
    } catch {}
  }, [getCtx]);

  const playGlitch = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      for (let i = 0; i < 5; i++) {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = Math.random() > 0.5 ? 'square' : 'sine';
        osc.frequency.setValueAtTime(Math.random() * 2000 + 100, context.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.01, context.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + i * 0.05 + 0.05);
        osc.start(context.currentTime + i * 0.05);
        osc.stop(context.currentTime + i * 0.05 + 0.05);
      }
    } catch {}
  }, [getCtx]);

  return { playClick, playHum, playSuccess, playError, playWarp, playGlitch };
}
