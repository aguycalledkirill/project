import type { Vec2 } from './types';

/**
 * Pure geometry utilities. No DOM, no React, no p5.
 *
 * The CONDUCTOR path is a closed loop of CUBIC Bezier segments. For n
 * ictuses there are n segments and 2n controls. controls[2i] is the
 * outgoing control just after ictuses[i]; controls[2i+1] is the
 * incoming control just before ictuses[(i+1) mod n].
 *
 * Articulation parameter (0..1):
 *   0 = STACCATO  — controls collapse onto their ictuses, segments become
 *                   straight lines, ictuses become hard polygon corners
 *   1 = LEGATO    — controls sit at their full pattern-defined positions,
 *                   segments are pristine cubic Bezier swoops, ictuses
 *                   become smooth direction changes
 *   in between    — linear interpolation between sharp and smooth
 */

const f = (n: number): string => n.toFixed(4);

export interface PathPoints {
  ictuses: Vec2[];
  controls: Vec2[]; // length === 2 * ictuses.length
}

function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function buildPath({ ictuses, controls }: PathPoints, articulation = 1): string {
  const n = ictuses.length;
  if (n < 2 || controls.length !== 2 * n) return '';
  const t = Math.max(0, Math.min(1, articulation));
  let d = `M ${f(ictuses[0][0])} ${f(ictuses[0][1])}`;
  for (let i = 0; i < n; i++) {
    const start = ictuses[i];
    const end = ictuses[(i + 1) % n];
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

export function transformPoint(p: Vec2, rotationRad: number, scaleFactor: number): Vec2 {
  return scale2(rotate2(p, rotationRad), scaleFactor);
}
