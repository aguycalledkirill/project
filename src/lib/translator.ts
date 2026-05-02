import { catmullRomToBezier } from './catmull';
import { mulberry32 } from './prng';
import type { BBox, Vec2 } from './types';

/**
 * CONDUCTOR translator — turns a single conductor-gesture path through space
 * into a Cursor-style stacked vector composition.
 *
 * HARD CONSTRAINT — DO NOT VIOLATE:
 * This module is pure: data in, data out. It MUST NOT import from `react`,
 * `react-dom`, `p5`, or any DOM API. It will be ported to Swift in Part 2,
 * where the input `path` will come from a `VNHumanHandPoseObservation`
 * stream (Vision framework hand-tracking) instead of a synthetic conducting
 * pattern. Keep behavior 1:1 portable.
 *
 * Algorithm:
 *   For each iteration i in [0, iterations):
 *     1. Seed mulberry32 with `seed * 7919 + i`.
 *     2. Jitter every interior point (NOT the first or last) by
 *        `variation * 0.1 * [(rand-0.5)*2, (rand-0.5)*2]`.
 *     3. Run Catmull-Rom -> Bezier with the given smoothing tension to
 *        produce a smooth cubic-bezier `d` string.
 *   Compute the bbox over all jittered points across all iterations.
 *
 * @param input.path raw points in viewport units (typically [-1, 1]).
 * @param input.iterations how many stacked passes to draw.
 * @param input.variation 0..1 — how much each iteration deviates.
 * @param input.smoothing 0..1 — Catmull-Rom tension. 0.5 is typical.
 * @param input.strokeWidth in viewBox units. Carried through as metadata
 *        only; the renderer is responsible for applying it.
 * @param input.seed deterministic seed. Same seed -> same output, always.
 * @returns `{ paths, bbox }` — `paths` is an array of SVG `d` strings.
 */
export interface TranslatorInput {
  path: Vec2[];
  iterations: number;
  variation: number;
  smoothing: number;
  strokeWidth: number;
  seed: number;
}

export interface TranslatorOutput {
  paths: string[];
  bbox: BBox;
}

const JITTER_SCALE = 0.1;

export function translate(input: TranslatorInput): TranslatorOutput {
  const { path, iterations, variation, smoothing, seed } = input;
  const paths: string[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < iterations; i++) {
    const rand = mulberry32(seed * 7919 + i);
    const jittered: Vec2[] = path.map((p, idx) => {
      if (idx === 0 || idx === path.length - 1) return [p[0], p[1]];
      const dx = (rand() - 0.5) * 2 * variation * JITTER_SCALE;
      const dy = (rand() - 0.5) * 2 * variation * JITTER_SCALE;
      return [p[0] + dx, p[1] + dy];
    });

    for (const [x, y] of jittered) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    paths.push(catmullRomToBezier(jittered, smoothing));
  }

  const bbox: BBox =
    iterations > 0
      ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
      : { x: 0, y: 0, w: 0, h: 0 };

  return { paths, bbox };
}
