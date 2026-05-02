import type { Vec2 } from './types';

/**
 * Convert an array of points into a smooth cubic-bezier SVG path.
 * Uses uniform Catmull-Rom with the given tension (0..1).
 */
export function catmullRomToBezier(points: Vec2[], tension = 0.5): string {
  if (points.length < 2) return '';
  const t = tension;
  let d = `M ${points[0][0].toFixed(4)} ${points[0][1].toFixed(4)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1[0] + ((p2[0] - p0[0]) * t) / 3;
    const cp1y = p1[1] + ((p2[1] - p0[1]) * t) / 3;
    const cp2x = p2[0] - ((p3[0] - p1[0]) * t) / 3;
    const cp2y = p2[1] - ((p3[1] - p1[1]) * t) / 3;

    d += ` C ${cp1x.toFixed(4)} ${cp1y.toFixed(4)}, ${cp2x.toFixed(4)} ${cp2y.toFixed(4)}, ${p2[0].toFixed(4)} ${p2[1].toFixed(4)}`;
  }
  return d;
}
