import { useCallback, useEffect, useState } from 'react';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Creates a noise buffer for percussive texture
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const size = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function useSound() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('soundEnabled');
      if (stored !== null) setEnabled(stored === 'true');
    } catch {}
  }, []);

  const toggleSound = useCallback((value: boolean) => {
    setEnabled(value);
    try { localStorage.setItem('soundEnabled', String(value)); } catch {}
  }, []);

  // Correct placement — warm, satisfying "pop" with body
  const playThunk = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Main body: pitch-sweeping sine for the "pop"
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(480, t);
      osc1.frequency.exponentialRampToValueAtTime(160, t + 0.08);
      g1.gain.setValueAtTime(0.25, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc1.connect(g1).connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.12);

      // Subtle harmonic layer for warmth
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(720, t);
      osc2.frequency.exponentialRampToValueAtTime(240, t + 0.06);
      g2.gain.setValueAtTime(0.08, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc2.connect(g2).connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.08);

      // Tiny click transient from filtered noise
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.02);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.value = 3000;
      nf.Q.value = 1.5;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.06, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      noise.connect(nf).connect(ng).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.02);
    } catch {}
  }, [enabled]);

  // Incorrect placement — soft double-tap "nope"
  const playBuzz = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Two quick muted taps
      [0, 0.07].forEach((offset) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t + offset);
        osc.frequency.exponentialRampToValueAtTime(140, t + offset + 0.06);
        g.gain.setValueAtTime(0.18, t + offset);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06);
        osc.connect(g).connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.06);
      });
    } catch {}
  }, [enabled]);

  // Puzzle complete — rich ascending chord with shimmer
  const playWinChord = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Rich Cmaj7 chord voiced across two octaves, staggered
      const voices: [number, number, number, string][] = [
        // [freq, startOffset, duration, waveType]
        [261.63, 0,    0.9, 'sine'],      // C4
        [329.63, 0.08, 0.85, 'sine'],     // E4
        [392.0,  0.16, 0.8, 'sine'],      // G4
        [493.88, 0.24, 0.75, 'sine'],     // B4
        [523.25, 0.30, 0.7, 'sine'],      // C5
      ];

      voices.forEach(([freq, offset, dur, type]) => {
        // Main tone
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type as OscillatorType;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t + offset);
        g.gain.linearRampToValueAtTime(0.12, t + offset + 0.04);
        g.gain.setValueAtTime(0.12, t + offset + dur * 0.3);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + dur);

        // Subtle detuned layer for richness
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.003; // slight detune
        g2.gain.setValueAtTime(0, t + offset);
        g2.gain.linearRampToValueAtTime(0.04, t + offset + 0.06);
        g2.gain.exponentialRampToValueAtTime(0.001, t + offset + dur * 0.8);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(t + offset);
        osc2.stop(t + offset + dur);
      });

      // High shimmer at the end
      const shimmer = ctx.createOscillator();
      const sg = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = 1046.5; // C6
      sg.gain.setValueAtTime(0, t + 0.4);
      sg.gain.linearRampToValueAtTime(0.06, t + 0.5);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      shimmer.connect(sg).connect(ctx.destination);
      shimmer.start(t + 0.4);
      shimmer.stop(t + 1.2);
    } catch {}
  }, [enabled]);

  // Unlock achievement — bright ascending sparkle
  const playUnlockChime = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
      notes.forEach((freq, i) => {
        const offset = i * 0.09;
        const dur = 0.5 - i * 0.05;

        // Main bell-like tone
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t + offset);
        g.gain.linearRampToValueAtTime(0.13, t + offset + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + dur);

        // Harmonic overtone for bell character
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2.5;
        g2.gain.setValueAtTime(0, t + offset);
        g2.gain.linearRampToValueAtTime(0.03, t + offset + 0.01);
        g2.gain.exponentialRampToValueAtTime(0.001, t + offset + dur * 0.4);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(t + offset);
        osc2.stop(t + offset + dur);
      });
    } catch {}
  }, [enabled]);

  return { enabled, toggleSound, playThunk, playBuzz, playWinChord, playUnlockChime };
}
