import { describe, expect, it } from 'vitest';
import {
  easeInOutCubic,
  findIctusArcPositions,
  ictusCrossingsThisFrame,
  mapCycleToArc,
} from './timing';

describe('easeInOutCubic', () => {
  it('anchors at 0, 0.5, 1', () => {
    expect(easeInOutCubic(0)).toBeCloseTo(0, 6);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 6);
    expect(easeInOutCubic(1)).toBeCloseTo(1, 6);
  });

  it('clamps below 0 and above 1', () => {
    expect(easeInOutCubic(-1)).toBe(0);
    expect(easeInOutCubic(2)).toBe(1);
  });

  it('is monotonic across the unit interval', () => {
    let prev = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const e = easeInOutCubic(t);
      expect(e).toBeGreaterThanOrEqual(prev);
      prev = e;
    }
  });
});

describe('findIctusArcPositions', () => {
  it('locates ictuses at endpoint and midpoint of a straight sample line', () => {
    const samples: [number, number][] = Array.from({ length: 11 }, (_, i) => [i / 10, 0]);
    const ictuses: [number, number][] = [
      [0, 0],
      [0.5, 0],
      [1, 0],
    ];
    const arcs = findIctusArcPositions(samples, ictuses);
    expect(arcs[0]).toBeCloseTo(0, 6);
    expect(arcs[1]).toBeCloseTo(0.5, 6);
    expect(arcs[2]).toBeCloseTo(1, 6);
  });
});

describe('mapCycleToArc', () => {
  const ictusArcs = [0, 0.3, 0.6, 0.9];

  it('maps cycle=0 to the first ictus arc position', () => {
    expect(mapCycleToArc(0, ictusArcs)).toBeCloseTo(0, 6);
  });

  it('maps cycle = k/n to the k-th ictus arc position (n = ictus count)', () => {
    const n = ictusArcs.length;
    for (let k = 0; k < n; k++) {
      expect(mapCycleToArc(k / n, ictusArcs)).toBeCloseTo(ictusArcs[k], 6);
    }
  });

  it('wraps across cycle = 1 cleanly', () => {
    expect(mapCycleToArc(1, ictusArcs)).toBeCloseTo(0, 6);
    expect(mapCycleToArc(1.5, ictusArcs)).toBeCloseTo(mapCycleToArc(0.5, ictusArcs), 6);
  });

  it('handles arc wrap-around when last ictus is past 1 (closed loop)', () => {
    // 4-ictus pattern with last at 0.8; closing back to 0.
    const arcs = [0, 0.2, 0.5, 0.8];
    // Cycle 1 → segment 3, localT 0 → arc = 0.8 (the start of last segment)
    expect(mapCycleToArc(0.75, arcs)).toBeCloseTo(0.8, 6);
    // Cycle just before 1 → near end of last segment, arc close to 0 (wrap)
    const justBefore = mapCycleToArc(0.999, arcs);
    expect(justBefore).toBeGreaterThan(0.8);
    expect(justBefore).toBeLessThan(1);
  });

  it('eases through each segment (mid-segment value differs from linear)', () => {
    // Cycle exactly mid-segment 1 → linear would be (0.3 + 0.6)/2 = 0.45
    // With ease, mid-segment localT=0.5 → eased=0.5 → arc = 0.45 too.
    // Off-mid is where it differs:
    const linearAt375 = ictusArcs[1] + 0.25 * (ictusArcs[2] - ictusArcs[1]);
    // cycle = 1/4 + 0.25/4 = 0.3125 → segment 1, localT = 0.25
    const eased = mapCycleToArc(0.3125, ictusArcs);
    expect(eased).not.toBeCloseTo(linearAt375, 6);
    // Eased starts slow → should be less than linear
    expect(eased).toBeLessThan(linearAt375);
  });
});

describe('ictusCrossingsThisFrame', () => {
  it('detects no crossings within a small step that does not pass any ictus', () => {
    // n=4 → ictus boundaries at 0, 0.25, 0.5, 0.75
    expect(ictusCrossingsThisFrame(0.10, 0.20, 4)).toEqual([]);
  });

  it('detects a single crossing when stepping over one ictus', () => {
    // 0.20 → 0.30 crosses boundary 0.25 (ictus index 1)
    expect(ictusCrossingsThisFrame(0.20, 0.30, 4)).toEqual([1]);
  });

  it('detects wrap-around crossing of ictus 0 across cycle 1', () => {
    // 0.95 → 0.05 wraps; should hit boundary 0 (ictus 0)
    expect(ictusCrossingsThisFrame(0.95, 0.05, 4)).toEqual([0]);
  });
});
