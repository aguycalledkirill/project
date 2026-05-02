import { add2, buildPath, transformPoint } from './geometry';
import { mulberry32 } from './prng';
import type { BBox, Vec2 } from './types';

/**
 * CONDUCTOR translator — turns a single conducting-pattern geometry
 * (ictuses + cubic-Bezier controls) into a stacked Cursor-style vector
 * composition.
 *
 * HARD CONSTRAINT — DO NOT VIOLATE:
 * This module is pure: data in, data out. It MUST NOT import from `react`,
 * `react-dom`, `p5`, or any DOM API. It will be ported to Swift in Part 2,
 * where the input ictuses+controls will come from a Vision-framework
 * `VNHumanHandPoseObservation` stream (hand-tracking ictus detection).
 * Keep behavior 1:1 portable.
 *
 * Algorithm — for each iteration `i` in `[0, iterations)`:
 *   1. Seed mulberry32 with `seed * 7919 + i`.
 *   2. Compute per-iteration ROTATION and SCALE around the chosen PIVOT
 *      (origin (0,0) for the rotor-style fan, or any other point such as
 *      the spine base (0, 0.85) for a pendulum-style fan):
 *        t       = iterations === 1 ? 0 : (i / (iterations - 1)) - 0.5
 *        theta_i = t * spread * (PI / 180)
 *        s_i     = 1 + t * scale
 *   3. Apply jitter ONLY to control points (never to ictuses) so that
 *      precision of the beat corners is preserved while iterations vary.
 *      Jitter = `variation * 0.1 * [(rand-0.5)*2, (rand-0.5)*2]`.
 *   4. Transform every point (ictus + jittered control) by rotation then
 *      scale around the pivot.
 *   5. Emit a closed cubic-Bezier `d` string. Articulation may be a scalar
 *      or per-segment array: 0 = staccato/polygon, 1 = legato/full curves.
 */
export interface TranslatorInput {
  ictuses: readonly Vec2[];
  controls: readonly Vec2[]; // length === 2 * ictuses.length
  iterations: number;
  variation: number;
  spread: number;
  scale: number;
  articulation: number | readonly number[];
  pivot?: Vec2; // default [0, 0]
  seed: number;
}

export interface TranslatorOutput {
  paths: string[];
  bbox: BBox;
}

const JITTER_SCALE = 0.1;
const DEG2RAD = Math.PI / 180;
const ORIGIN: Vec2 = [0, 0];

export function translate(input: TranslatorInput): TranslatorOutput {
  const {
    ictuses,
    controls,
    iterations,
    variation,
    spread,
    scale,
    articulation,
    pivot = ORIGIN,
    seed,
  } = input;
  const paths: string[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < iterations; i++) {
    const rand = mulberry32(seed * 7919 + i);
    const t = iterations === 1 ? 0 : i / (iterations - 1) - 0.5;
    const theta = t * spread * DEG2RAD;
    const sFactor = 1 + t * scale;

    const tIctuses: Vec2[] = ictuses.map((p) => transformPoint(p, theta, sFactor, pivot));
    const tControls: Vec2[] = controls.map((p) => {
      const dx = (rand() - 0.5) * 2 * variation * JITTER_SCALE;
      const dy = (rand() - 0.5) * 2 * variation * JITTER_SCALE;
      const jittered = add2(p, [dx, dy]);
      return transformPoint(jittered, theta, sFactor, pivot);
    });

    for (const [x, y] of tIctuses) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    for (const [x, y] of tControls) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    paths.push(buildPath({ ictuses: tIctuses, controls: tControls }, articulation));
  }

  const bbox: BBox =
    iterations > 0
      ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
      : { x: 0, y: 0, w: 0, h: 0 };

  return { paths, bbox };
}
