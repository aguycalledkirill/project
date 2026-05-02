import type { Vec2 } from './types';

/**
 * Pure geometry utilities. No DOM, no React, no p5.
 *
 * The CONDUCTOR path is a closed loop of CUBIC Bezier segments. For n
 * ictuses there are n segments and 2n controls. controls[2i] is the
 * outgoing control just after ictuses[i]; controls[2i+1] is the
 * incoming control just before ictuses[(i+1) mod n].
 *
 * Articulation parameter (number or number[]):
 *   - As a scalar in [0, 1]: applied uniformly to every segment.
 *   - As an array of length n: per-segment articulation. articulation[i]
 *     controls the i-th segment (the one between ictuses[i] and
 *     ictuses[i+1]). Any out-of-range or short array entries fall back
 *     to 1 (full legato).
 *   0 = STACCATO  — controls collapse to their ictuses, segment is a
 *                   straight line, the ictus reads as a hard polygon corner
 *   1 = LEGATO    — controls at full pattern positions, segment is a
 *                   pristine cubic Bezier, the ictus is a smooth direction
 *                   change
 */

const f = (n: number): string => n.toFixed(4);

export interface PathPoints {
  ictuses: readonly Vec2[];
  controls: readonly Vec2[]; // length === 2 * ictuses.length
}

function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function buildPath(
  { ictuses, controls }: PathPoints,
  articulation: number | readonly number[] = 1,
): string {
  const n = ictuses.length;
  if (n < 2 || controls.length !== 2 * n) return '';
  const get = (i: number): number => {
    const v = typeof articulation === 'number' ? articulation : articulation[i] ?? 1;
    return clamp01(v);
  };
  let d = `M ${f(ictuses[0][0])} ${f(ictuses[0][1])}`;
  for (let i = 0; i < n; i++) {
    const start = ictuses[i];
    const end = ictuses[(i + 1) % n];
    const t = get(i);
    const c1 = lerp2(start, controls[2 * i], t);
    const c2 = lerp2(end, controls[2 * i + 1], t);
    d += ` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(end[0])} ${f(end[1])}`;
  }
  d += ' Z';
  return d;
}

export function rotate2(p: Vec2, radians: number): Vec2 {
  const cs = Math.cos(radians);
  const sn = Math.sin(radians);
  return [p[0] * cs - p[1] * sn, p[0] * sn + p[1] * cs];
}

export function scale2(p: Vec2, factor: number): Vec2 {
  return [p[0] * factor, p[1] * factor];
}

export function add2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

/**
 * Apply rotation then uniform scale around the given pivot.
 * The path's nominal pivot is the visual origin (0, 0) — passing
 * `pivot = [0, 0]` matches the previous behaviour. Passing the spine
 * base produces a pendulum-style fan instead of a rotor-style fan.
 */
export function transformPoint(
  p: Vec2,
  rotationRad: number,
  scaleFactor: number,
  pivot: Vec2 = [0, 0],
): Vec2 {
  const local = sub2(p, pivot);
  const rotated = rotate2(local, rotationRad);
  const scaled = scale2(rotated, scaleFactor);
  return add2(scaled, pivot);
}
