import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mulberry32 } from '../lib/prng';
import type { Signature } from '../lib/patterns';

export type Aspect = '1:1' | '3:1' | '4:5' | '9:16';
export type Theme = 'light' | 'dark';

export interface ConductorState {
  signature: Signature;
  iterations: number;
  variation: number;
  smoothing: number;
  strokeWidth: number;
  tempo: number;
  seed: number;
  aspect: Aspect;
  showGrid: boolean;
  animation: boolean;
  theme: Theme;

  setSignature: (s: Signature) => void;
  setIterations: (n: number) => void;
  setVariation: (n: number) => void;
  setSmoothing: (n: number) => void;
  setStrokeWidth: (n: number) => void;
  setTempo: (n: number) => void;
  setSeed: (n: number) => void;
  rerollSeed: () => void;
  setAspect: (a: Aspect) => void;
  setShowGrid: (b: boolean) => void;
  setAnimation: (b: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

export const useConductorStore = create<ConductorState>()(
  persist(
    (set, get) => ({
      signature: '4/4',
      iterations: 12,
      variation: 0.06,
      smoothing: 0.55,
      strokeWidth: 1.25,
      tempo: 72,
      seed: 42,
      aspect: '1:1',
      showGrid: false,
      animation: true,
      theme: 'light',

      setSignature: (signature) => set({ signature }),
      setIterations: (iterations) => set({ iterations }),
      setVariation: (variation) => set({ variation }),
      setSmoothing: (smoothing) => set({ smoothing }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      setTempo: (tempo) => set({ tempo }),
      setSeed: (seed) => set({ seed }),
      rerollSeed: () => {
        // No Math.random — seed the PRNG from current seed + Date.now() so
        // re-rolls remain reproducible from the prior state.
        const rand = mulberry32((get().seed ^ Date.now()) | 0);
        set({ seed: Math.floor(rand() * 1_000_000_000) });
      },
      setAspect: (aspect) => set({ aspect }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setAnimation: (animation) => set({ animation }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'conductor:v0.1',
      version: 1,
      partialize: (state) => ({
        signature: state.signature,
        iterations: state.iterations,
        variation: state.variation,
        smoothing: state.smoothing,
        strokeWidth: state.strokeWidth,
        tempo: state.tempo,
        seed: state.seed,
        aspect: state.aspect,
        showGrid: state.showGrid,
        animation: state.animation,
        theme: state.theme,
      }),
    },
  ),
);
