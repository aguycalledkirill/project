import { describe, expect, it } from 'vitest';
import { PATTERNS } from './patterns';
import { translate, type TranslatorInput } from './translator';

const baseInput: TranslatorInput = {
  ictuses: PATTERNS['4/4'].ictuses as unknown as [number, number][],
  controls: PATTERNS['4/4'].controls as unknown as [number, number][],
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
    // Each cubic command's two controls should equal their adjacent ictus
    // when articulation is 0.
    const segments = path.match(/C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/g);
    expect(segments).not.toBeNull();
    expect(segments!.length).toBe(baseInput.ictuses.length);
    // Pull first segment, check c1 == start ictus and c2 == end ictus.
    const first = segments![0].match(/C (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+), (-?\d+\.\d+) (-?\d+\.\d+)/)!;
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

  it('every pattern has 2n controls for n ictuses', () => {
    for (const [name, p] of Object.entries(PATTERNS)) {
      expect(p.controls.length, `pattern ${name}`).toBe(p.ictuses.length * 2);
    }
  });
});
