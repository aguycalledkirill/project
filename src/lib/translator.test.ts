import { describe, expect, it } from 'vitest';
import { PATTERNS } from './patterns';
import { translate, type TranslatorInput } from './translator';

const baseInput: TranslatorInput = {
  ictuses: PATTERNS['4/4'].ictuses,
  controls: PATTERNS['4/4'].controls,
  iterations: 12,
  variation: 0.0,
  spread: 18,
  scale: 0.0,
  articulation: 1.0,
  seed: 42,
};

describe('translate', () => {
  it('is deterministic — same seed produces identical paths', () => {
    const a = translate(baseInput);
    const b = translate(baseInput);
    expect(a.paths).toEqual(b.paths);
    expect(a.bbox).toEqual(b.bbox);
    expect(a.paths.length).toBe(baseInput.iterations);
  });

  it('produces a finite bbox bounded by the unit square (within tolerance)', () => {
    const { bbox } = translate(baseInput);
    expect(Number.isFinite(bbox.x)).toBe(true);
    expect(Number.isFinite(bbox.y)).toBe(true);
    expect(bbox.w).toBeGreaterThan(0);
    expect(bbox.h).toBeGreaterThan(0);
    expect(bbox.x).toBeGreaterThanOrEqual(-1.2);
    expect(bbox.x + bbox.w).toBeLessThanOrEqual(1.2);
    expect(bbox.y).toBeGreaterThanOrEqual(-1.2);
    expect(bbox.y + bbox.h).toBeLessThanOrEqual(1.2);
  });

  it('changes output when seed changes (with non-zero variation)', () => {
    const a = translate({ ...baseInput, variation: 0.06 });
    const b = translate({ ...baseInput, variation: 0.06, seed: 43 });
    expect(a.paths).not.toEqual(b.paths);
  });

  it('produces identical paths across iterations when spread/scale/variation are 0', () => {
    const a = translate({
      ...baseInput,
      variation: 0,
      spread: 0,
      scale: 0,
      iterations: 3,
    });
    expect(a.paths[0]).toBe(a.paths[1]);
    expect(a.paths[1]).toBe(a.paths[2]);
  });

  it('preserves ictus precision: variation>0 still leaves ictuses untouched', () => {
    const a = translate({ ...baseInput, variation: 0.2, spread: 0, scale: 0 });
    const firstIctus = baseInput.ictuses[0];
    const m = a.paths[0].match(/^M (-?\d+\.\d+) (-?\d+\.\d+)/);
    expect(m).not.toBeNull();
    expect(parseFloat(m![1])).toBeCloseTo(firstIctus[0], 4);
    expect(parseFloat(m![2])).toBeCloseTo(firstIctus[1], 4);
  });

  it('articulation = 0 collapses controls to ictuses (line-only segments)', () => {
    const a = translate({ ...baseInput, articulation: 0, spread: 0, scale: 0, iterations: 1 });
    const path = a.paths[0];
    const segments = path.match(
      /C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/g,
    );
    expect(segments).not.toBeNull();
    expect(segments!.length).toBe(baseInput.ictuses.length);
    const first = segments![0].match(
      /C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/,
    )!;
    const i0 = baseInput.ictuses[0];
    const i1 = baseInput.ictuses[1];
    expect(parseFloat(first[1])).toBeCloseTo(i0[0], 4);
    expect(parseFloat(first[2])).toBeCloseTo(i0[1], 4);
    expect(parseFloat(first[3])).toBeCloseTo(i1[0], 4);
    expect(parseFloat(first[4])).toBeCloseTo(i1[1], 4);
  });

  it('articulation = 1 yields different output than articulation = 0', () => {
    const sharp = translate({ ...baseInput, articulation: 0 });
    const smooth = translate({ ...baseInput, articulation: 1 });
    expect(sharp.paths).not.toEqual(smooth.paths);
  });

  it('per-segment articulation: array of [0,1,...] only smooths the segments at index 1', () => {
    // 4/4 has 4 ictuses → 4 segments. Pass [0, 1, 0, 0]: only segment 1
    // (between ictuses[1] and ictuses[2]) keeps its full curve; the others
    // collapse to straight lines.
    const a = translate({
      ...baseInput,
      articulation: [0, 1, 0, 0],
      spread: 0,
      scale: 0,
      iterations: 1,
    });
    const segments = a.paths[0].match(
      /C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/g,
    )!;
    const seg1 = segments[1].match(
      /C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/,
    )!;
    const seg2 = segments[2].match(
      /C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/,
    )!;
    // Segment 2 collapses: c1 == ictuses[2], c2 == ictuses[3].
    const i2 = baseInput.ictuses[2];
    const i3 = baseInput.ictuses[3];
    expect(parseFloat(seg2[1])).toBeCloseTo(i2[0], 4);
    expect(parseFloat(seg2[2])).toBeCloseTo(i2[1], 4);
    expect(parseFloat(seg2[3])).toBeCloseTo(i3[0], 4);
    expect(parseFloat(seg2[4])).toBeCloseTo(i3[1], 4);
    // Segment 1 does NOT collapse: at least one of its control coordinates
    // differs from its anchor ictus.
    const i1 = baseInput.ictuses[1];
    const c1Differs =
      Math.abs(parseFloat(seg1[1]) - i1[0]) > 1e-3 ||
      Math.abs(parseFloat(seg1[2]) - i1[1]) > 1e-3;
    expect(c1Differs).toBe(true);
  });

  it('pivot=spineBase produces a different bbox than pivot=origin (with non-zero spread)', () => {
    const origin = translate({ ...baseInput, pivot: [0, 0], spread: 60 });
    const spine = translate({ ...baseInput, pivot: [0, 0.85], spread: 60 });
    expect(origin.bbox).not.toEqual(spine.bbox);
  });

  it('every pattern has 2n controls for n ictuses', () => {
    for (const [name, p] of Object.entries(PATTERNS)) {
      expect(p.controls.length, `pattern ${name}`).toBe(p.ictuses.length * 2);
    }
  });
});
