import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { PATTERNS } from '../lib/patterns';
import { buildPath, transformPoint } from '../lib/geometry';
import {
  findIctusArcPositions,
  ictusCrossingsThisFrame,
  mapCycleToArc,
} from '../lib/timing';
import type { Vec2 } from '../lib/types';
import { useConductorStore } from '../store/useConductorStore';

const SAMPLE_COUNT = 600;
const SPINE_BASE: Vec2 = [0, 0.85];
const ORIGIN: Vec2 = [0, 0];
const PULSE_LIFE_FRAMES = 36; // ~0.6s at 60fps
const PULSE_MAX_RADIUS_VB = 0.06; // viewBox units the ring expands to

interface Pulse {
  ictusIdx: number;
  age: number; // frames since spawn
}

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function AnimatedCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Only mount/unmount p5 when these change. Everything else is read per
  // frame via store.getState() so dragging sliders doesn't churn p5.
  const animation = useConductorStore((s) => s.animation);
  const signature = useConductorStore((s) => s.signature);
  const articulation = useConductorStore((s) => s.articulation);
  const theme = useConductorStore((s) => s.theme);

  useEffect(() => {
    if (!animation) return;
    const container = containerRef.current;
    if (!container) return;

    const pattern = PATTERNS[signature];
    // Sample the FULL-LEGATO version of the path so the baton always
    // travels a smooth curve regardless of articulation. Articulation
    // affects the static SVG corners, not the conductor's hand path.
    const d = buildPath(
      { ictuses: pattern.ictuses, controls: pattern.controls },
      Math.max(articulation, 0.6),
    );

    // Sample once via a hidden SVGPathElement — exact arc-length math.
    const svgNS = 'http://www.w3.org/2000/svg';
    const tmpSvg = document.createElementNS(svgNS, 'svg');
    tmpSvg.setAttribute('viewBox', '-1 -1 2 2');
    tmpSvg.style.position = 'absolute';
    tmpSvg.style.opacity = '0';
    tmpSvg.style.pointerEvents = 'none';
    const tmpPath = document.createElementNS(svgNS, 'path');
    tmpPath.setAttribute('d', d);
    tmpSvg.appendChild(tmpPath);
    document.body.appendChild(tmpSvg);
    const totalLength = tmpPath.getTotalLength();
    const samples: Vec2[] = Array.from({ length: SAMPLE_COUNT }, (_, i) => {
      const pt = tmpPath.getPointAtLength((i / (SAMPLE_COUNT - 1)) * totalLength);
      return [pt.x, pt.y];
    });
    document.body.removeChild(tmpSvg);

    // Anchor each ictus to its arc-length fraction. Used by the eased
    // cycle→arc mapping so the baton pauses at every beat.
    const ictusArcs = findIctusArcPositions(samples, pattern.ictuses);

    let cycle = 0;
    const pulses: Pulse[] = [];

    const sketch = (p: p5) => {
      let w = container.clientWidth;
      let h = container.clientHeight;

      const toScreen = (vx: number, vy: number): [number, number] => {
        const size = Math.min(w, h);
        const cx = w / 2;
        const cy = h / 2;
        return [cx + (vx * size) / 2, cy + (vy * size) / 2];
      };

      // Map a viewBox-unit length to screen pixels (size = viewBox 2 → screen size px).
      const vbToPx = (n: number): number => (n * Math.min(w, h)) / 2;

      p.setup = () => {
        const canvas = p.createCanvas(w, h);
        canvas.elt.style.display = 'block';
        p.frameRate(60);
        p.background(readToken('--paper', '#F5F2ED'));
      };

      p.windowResized = () => {
        w = container.clientWidth;
        h = container.clientHeight;
        p.resizeCanvas(w, h);
        p.background(readToken('--paper', '#F5F2ED'));
      };

      p.draw = () => {
        const state = useConductorStore.getState();
        const iterations = Math.max(1, state.iterations);
        const spread = state.spread;
        const scaleAmt = state.scale;
        const tempo = state.tempo;
        const strokeWidth = state.strokeWidth;
        const pivot: Vec2 = state.pivot === 'spineBase' ? SPINE_BASE : ORIGIN;
        const pulsesEnabled = state.ictusPulses;
        const accentLast = state.accentLast;

        const paper = readToken('--paper', '#F5F2ED');
        const ink = readToken('--ink', '#0A0A0A');
        const accent = readToken('--accent', '#C73E1D');

        // Trail fade — translucent paper rect.
        const fade = p.color(paper);
        fade.setAlpha(34);
        p.noStroke();
        p.fill(fade);
        p.rect(0, 0, w, h);

        // Advance cycle. One full pattern = pattern.beats beats; tempo BPM.
        const dtPerFrame = tempo / 60 / pattern.beats / 60;
        const prevCycle = cycle;
        cycle = (cycle + dtPerFrame) % 1;

        // Eased arc fraction for this frame.
        const arcFrac = mapCycleToArc(cycle, ictusArcs);
        const baseIdx = Math.min(
          samples.length - 1,
          Math.max(0, Math.round(arcFrac * (samples.length - 1))),
        );
        const baseSample = samples[baseIdx];

        // Per-iteration baton tips. Each iteration gets its own theta + sFactor
        // (matches the spread/scale fan in StaticCanvas), all sweep in unison.
        const tipPxRadius = Math.max(2, vbToPx(strokeWidth * 0.0035) + 2);
        for (let i = 0; i < iterations; i++) {
          const t = iterations === 1 ? 0 : i / (iterations - 1) - 0.5;
          const theta = t * spread * (Math.PI / 180);
          const sFactor = 1 + t * scaleAmt;
          const tipVB = transformPoint(baseSample, theta, sFactor, pivot);
          const [tx, ty] = toScreen(tipVB[0], tipVB[1]);
          const isAccent = accentLast && i === iterations - 1;
          p.noStroke();
          p.fill(isAccent ? accent : ink);
          p.circle(tx, ty, tipPxRadius * 2);
        }

        // Detect ictus crossings for pulse spawning.
        if (pulsesEnabled) {
          const hits = ictusCrossingsThisFrame(prevCycle, cycle, ictusArcs.length);
          for (const idx of hits) {
            pulses.push({ ictusIdx: idx, age: 0 });
          }
        }

        // Render + age pulse rings (stroke-only, on-brand).
        if (pulses.length > 0) {
          const ringStroke = p.color(ink);
          for (let i = pulses.length - 1; i >= 0; i--) {
            const pulse = pulses[i];
            const lifeT = pulse.age / PULSE_LIFE_FRAMES;
            if (lifeT >= 1) {
              pulses.splice(i, 1);
              continue;
            }
            // Ring grows; alpha fades as cube of remaining life for a soft tail.
            const radiusVB = lifeT * PULSE_MAX_RADIUS_VB;
            const alpha = Math.round((1 - lifeT) * (1 - lifeT) * 200);
            ringStroke.setAlpha(alpha);
            p.stroke(ringStroke);
            p.strokeWeight(Math.max(1, vbToPx(strokeWidth * 0.0025)));
            p.noFill();
            // Draw the ring at the ictus position of the FIRST iteration only,
            // transformed by iteration 0's identity (no spread offset). Keeps
            // the pulse anchored to the canonical pattern reading.
            const ictusPos = pattern.ictuses[pulse.ictusIdx];
            const [px, py] = toScreen(ictusPos[0], ictusPos[1]);
            p.circle(px, py, vbToPx(radiusVB) * 2);
            pulse.age += 1;
          }
        }
      };
    };

    const instance = new p5(sketch, container);

    return () => {
      instance.remove();
    };
  }, [animation, signature, articulation, theme]);

  if (!animation) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
      }}
    />
  );
}
