import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mulberry32 } from '../lib/prng';
import type { Signature } from '../lib/patterns';
import type { PaletteName } from '../lib/palettes';

export type Aspect = '1:1' | '3:1' | '4:5' | '9:16';
export type Theme = 'light' | 'dark';
export type Pivot = 'origin' | 'spineBase';

export interface ConductorState {
  signature: Signature;
  iterations: number;
  variation: number; // 0..1 jitter on Bezier control points
  spread: number; // total degrees of rotational fan across iterations
  scale: number; // 0..1 fractional scale fan across iterations
  articulation: number; // 0 staccato → 1 legato (uniform across segments)
  pivot: Pivot;
  strokeWidth: number;
  tempo: number;
  seed: number;
  aspect: Aspect;
  showGrid: boolean;
  showIctusMarkers: boolean;
  animation: boolean;
  ictusPulses: boolean;
  accentLast: boolean;
  palette: PaletteName;
  theme: Theme;

  setSignature: (s: Signature) => void;
  setIterations: (n: number) => void;
  setVariation: (n: number) => void;
  setSpread: (n: number) => void;
  setScale: (n: number) => void;
  setArticulation: (n: number) => void;
  setPivot: (p: Pivot) => void;
  setStrokeWidth: (n: number) => void;
  setTempo: (n: number) => void;
  setSeed: (n: number) => void;
  rerollSeed: () => void;
  setAspect: (a: Aspect) => void;
  setShowGrid: (b: boolean) => void;
  setShowIctusMarkers: (b: boolean) => void;
  setAnimation: (b: boolean) => void;
  setIctusPulses: (b: boolean) => void;
  setAccentLast: (b: boolean) => void;
  setPalette: (p: PaletteName) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const DEFAULTS = {
  signature: '4/4' as Signature,
  iterations: 24,
  variation: 0.0,
  spread: 18,
  scale: 0.0,
  articulation: 1.0,
  pivot: 'origin' as Pivot,
  strokeWidth: 1.0,
  tempo: 72,
  seed: 42,
  aspect: '1:1' as Aspect,
  showGrid: false,
  showIctusMarkers: false,
  animation: true,
  ictusPulses: false,
  accentLast: false,
  palette: 'Editorial' as PaletteName,
  theme: 'light' as Theme,
};

export const useConductorStore = create<ConductorState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setSignature: (signature) => set({ signature }),
      setIterations: (iterations) => set({ iterations }),
      setVariation: (variation) => set({ variation }),
      setSpread: (spread) => set({ spread }),
      setScale: (scale) => set({ scale }),
      setArticulation: (articulation) => set({ articulation }),
      setPivot: (pivot) => set({ pivot }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      setTempo: (tempo) => set({ tempo }),
      setSeed: (seed) => set({ seed }),
      rerollSeed: () => {
        const rand = mulberry32((get().seed ^ Date.now()) | 0);
        set({ seed: Math.floor(rand() * 1_000_000_000) });
      },
      setAspect: (aspect) => set({ aspect }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setShowIctusMarkers: (showIctusMarkers) => set({ showIctusMarkers }),
      setAnimation: (animation) => set({ animation }),
      setIctusPulses: (ictusPulses) => set({ ictusPulses }),
      setAccentLast: (accentLast) => set({ accentLast }),
      setPalette: (palette) => set({ palette }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'conductor:v0.4',
      version: 4,
      // Carry over compatible fields from older persisted state, fill any
      // missing ones with current defaults. Drops nothing silently.
      migrate: (persisted, _fromVersion) => {
        const incoming = (persisted ?? {}) as Partial<ConductorState>;
        return { ...DEFAULTS, ...incoming } as ConductorState;
      },
      partialize: (state) => ({
        signature: state.signature,
        iterations: state.iterations,
        variation: state.variation,
        spread: state.spread,
        scale: state.scale,
        articulation: state.articulation,
        pivot: state.pivot,
        strokeWidth: state.strokeWidth,
        tempo: state.tempo,
        seed: state.seed,
        aspect: state.aspect,
        showGrid: state.showGrid,
        showIctusMarkers: state.showIctusMarkers,
        animation: state.animation,
        ictusPulses: state.ictusPulses,
        accentLast: state.accentLast,
        palette: state.palette,
        theme: state.theme,
      }),
    },
  ),
);
