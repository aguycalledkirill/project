import type { Vec2 } from './types';

/**
 * Pure geometry utilities. No DOM, no React, no p5.
 *
 * The CONDUCTOR path is built as a closed loop of quadratic Bezier
 * segments. Each segment goes from ictus[i] through control[i] to
 * ictus[(i+1) % n]. Where two segments meet at an ictus they have
 * different tangents, so the ictus reads as a sharp corner — exactly the
 * "scientific" feel we want from a real conducting beat.
 */

const f = (n: number): string => n.toFixed(4);

export interface PathPoints {
  ictuses: Vec2[];
  controls: Vec2[];
}

export function buildPath({ ictuses, controls }: PathPoints): string {
  if (ictuses.length < 2 || controls.length !== ictuses.length) return '';
  let d = `M ${f(ictuses[0][0])} ${f(ictuses[0][1])}`;
  for (let i = 0; i < ictuses.length; i++) {
    const c = controls[i];
    const next = ictuses[(i + 1) % ictuses.length];
    d += ` Q ${f(c[0])} ${f(c[1])}, ${f(next[0])} ${f(next[1])}`;
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

/**
 * Apply rotation then uniform scale around the origin (0,0).
 * The path is centered at (0,0), so this rotates/scales each iteration
 * around the visual center of the composition.
 */
export function transformPoint(p: Vec2, rotationRad: number, scaleFactor: number): Vec2 {
  return scale2(rotate2(p, rotationRad), scaleFactor);
}
