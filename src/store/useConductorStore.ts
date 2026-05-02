import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mulberry32 } from '../lib/prng';
import type { Signature } from '../lib/patterns';

export type Aspect = '1:1' | '3:1' | '4:5' | '9:16';
export type Theme = 'light' | 'dark';

export interface ConductorState {
  signature: Signature;
  iterations: number;
  variation: number; // 0..1 jitter on Bezier control points (ictuses stay precise)
  spread: number; // total degrees of rotational fan across iterations
  scale: number; // 0..1 fractional scale fan across iterations
  strokeWidth: number;
  tempo: number;
  seed: number;
  aspect: Aspect;
  showGrid: boolean;
  animation: boolean;
  accentLast: boolean;
  theme: Theme;

  setSignature: (s: Signature) => void;
  setIterations: (n: number) => void;
  setVariation: (n: number) => void;
  setSpread: (n: number) => void;
  setScale: (n: number) => void;
  setStrokeWidth: (n: number) => void;
  setTempo: (n: number) => void;
  setSeed: (n: number) => void;
  rerollSeed: () => void;
  setAspect: (a: Aspect) => void;
  setShowGrid: (b: boolean) => void;
  setAnimation: (b: boolean) => void;
  setAccentLast: (b: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

export const useConductorStore = create<ConductorState>()(
  persist(
    (set, get) => ({
      signature: '4/4',
      iterations: 24,
      variation: 0.0,
      spread: 18,
      scale: 0.0,
      strokeWidth: 1.0,
      tempo: 72,
      seed: 42,
      aspect: '1:1',
      showGrid: false,
      animation: true,
      accentLast: false,
      theme: 'light',

      setSignature: (signature) => set({ signature }),
      setIterations: (iterations) => set({ iterations }),
      setVariation: (variation) => set({ variation }),
      setSpread: (spread) => set({ spread }),
      setScale: (scale) => set({ scale }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      setTempo: (tempo) => set({ tempo }),
      setSeed: (seed) => set({ seed }),
      rerollSeed: () => {
        const rand = mulberry32((get().seed ^ Date.now()) | 0);
        set({ seed: Math.floor(rand() * 1_000_000_000) });
      },
      setAspect: (aspect) => set({ aspect }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setAnimation: (animation) => set({ animation }),
      setAccentLast: (accentLast) => set({ accentLast }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'conductor:v0.2',
      version: 2,
      partialize: (state) => ({
        signature: state.signature,
        iterations: state.iterations,
        variation: state.variation,
        spread: state.spread,
        scale: state.scale,
        strokeWidth: state.strokeWidth,
        tempo: state.tempo,
        seed: state.seed,
        aspect: state.aspect,
        showGrid: state.showGrid,
        animation: state.animation,
        accentLast: state.accentLast,
        theme: state.theme,
      }),
    },
  ),
);
