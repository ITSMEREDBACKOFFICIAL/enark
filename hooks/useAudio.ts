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

  // A short, mechanical click — used for button presses & filter switches
  const playClick = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.08, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.04);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.05);
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
      oscillator.frequency.setValueAtTime(60, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.06, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.4);
    } catch {}
  }, [getCtx]);

  const playSuccess = useCallback(() => {
    if (isMuted()) return;
    try {
      const context = getCtx();
      [880, 1100].forEach((freq, i) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, context.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.06, context.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + i * 0.08 + 0.15);
        osc.start(context.currentTime + i * 0.08);
        osc.stop(context.currentTime + i * 0.08 + 0.15);
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
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, context.currentTime);
      gain.gain.setValueAtTime(0.1, context.currentTime);
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
      osc.frequency.setValueAtTime(80, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, context.currentTime + 1.8);
      
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.8);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 1.8);
    } catch {}
  }, [getCtx]);

  return { playClick, playHum, playSuccess, playError, playWarp };
}
