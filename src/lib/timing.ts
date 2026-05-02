import type { Vec2 } from './types';

/**
 * Animation timing utilities. Pure functions, no DOM.
 *
 * The CONDUCTOR baton must FEEL like a conductor — accelerate into each
 * ictus and pause briefly at the beat point, then accelerate out. The
 * default linear arc-length traversal feels mechanical because it sweeps
 * past the ictuses at constant speed.
 *
 * Approach: divide the cycle [0, 1) into n equal time slices, one per
 * segment between consecutive ictuses. Each beat takes the same TIME
 * (musical equivalence) regardless of arc length. Within each segment,
 * apply easeInOutCubic so the baton starts slowly, peaks mid-segment,
 * and decelerates into the next ictus.
 */

export function easeInOutCubic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * For each ictus position, find the arc-length fraction (0..1) at which
 * the supplied path samples are closest to that ictus. Used as anchor
 * points for the eased cycle→arc mapping.
 *
 * `samples` is expected to be points sampled at uniform arc length along
 * the path (e.g., from `SVGPathElement.getPointAtLength`).
 */
export function findIctusArcPositions(
  samples: readonly Vec2[],
  ictuses: readonly Vec2[],
): number[] {
  if (samples.length < 2) return ictuses.map(() => 0);
  const lastIdx = samples.length - 1;
  return ictuses.map((target) => {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i <= lastIdx; i++) {
      const dx = samples[i][0] - target[0];
      const dy = samples[i][1] - target[1];
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx / lastIdx;
  });
}

/**
 * Map a cycle position (0..1, time-uniform) to an arc-length fraction
 * (0..1) such that the baton pauses-eases-pauses through every ictus.
 *
 * Each segment between consecutive ictuses gets equal cycle time; arc
 * advance within a segment is eased via easeInOutCubic. Wraps cleanly
 * across the cycle boundary (last ictus → first).
 */
export function mapCycleToArc(
  cycle: number,
  ictusArcPositions: readonly number[],
  ease: (t: number) => number = easeInOutCubic,
): number {
  const n = ictusArcPositions.length;
  if (n === 0) return 0;
  if (n === 1) return ictusArcPositions[0];

  // Normalise cycle to [0, 1)
  let c = cycle - Math.floor(cycle);
  if (c < 0) c += 1;

  const cycleN = c * n;
  const segIdx = Math.floor(cycleN) % n;
  const localT = cycleN - Math.floor(cycleN);
  const eased = ease(localT);

  const startArc = ictusArcPositions[segIdx];
  const endArc = ictusArcPositions[(segIdx + 1) % n];

  if (endArc < startArc) {
    // Wraps across arc-length 1 → 0
    const total = 1 - startArc + endArc;
    const arc = startArc + eased * total;
    return arc >= 1 ? arc - 1 : arc;
  }
  return startArc + eased * (endArc - startArc);
}

/**
 * Detect whether `cycle` has crossed any ictus boundary since the
 * previous frame. Returns the indices of all ictus boundaries crossed
 * (typically 0 or 1 indices unless the frame interval is huge).
 *
 * Used to trigger ictus pulses when the baton lands on a beat.
 */
export function ictusCrossingsThisFrame(
  prevCycle: number,
  nextCycle: number,
  ictusCount: number,
): number[] {
  if (ictusCount < 1) return [];
  // Each ictus i corresponds to cycle position i/ictusCount.
  const hits: number[] = [];
  let prev = prevCycle - Math.floor(prevCycle);
  let next = nextCycle - Math.floor(nextCycle);
  if (prev < 0) prev += 1;
  if (next < 0) next += 1;
  // Normalise the wrap-across-1 case by treating next < prev as a wrap.
  for (let i = 0; i < ictusCount; i++) {
    const boundary = i / ictusCount;
    const wrapped = next < prev;
    const inside = wrapped
      ? boundary >= prev || boundary < next
      : boundary >= prev && boundary < next;
    if (inside) hits.push(i);
  }
  return hits;
}
