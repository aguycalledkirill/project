import { describe, expect, it } from 'vitest';
import { PATTERNS } from './patterns';
import { translate, type TranslatorInput } from './translator';

const baseInput: TranslatorInput = {
  path: PATTERNS['4/4'].points as unknown as [number, number][],
  iterations: 12,
  variation: 0.06,
  smoothing: 0.55,
  strokeWidth: 0.0025,
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

  it('produces a finite bbox with positive width and height', () => {
    const { bbox } = translate(baseInput);
    expect(Number.isFinite(bbox.x)).toBe(true);
    expect(Number.isFinite(bbox.y)).toBe(true);
    expect(bbox.w).toBeGreaterThan(0);
    expect(bbox.h).toBeGreaterThan(0);
    expect(bbox.x).toBeGreaterThanOrEqual(-1.1);
    expect(bbox.x + bbox.w).toBeLessThanOrEqual(1.1);
    expect(bbox.y).toBeGreaterThanOrEqual(-1.1);
    expect(bbox.y + bbox.h).toBeLessThanOrEqual(1.1);
  });

  it('changes output when seed changes', () => {
    const a = translate(baseInput);
    const b = translate({ ...baseInput, seed: 43 });
    expect(a.paths).not.toEqual(b.paths);
  });

  it('returns unjittered paths when variation is zero', () => {
    const a = translate({ ...baseInput, variation: 0, iterations: 3 });
    expect(a.paths[0]).toBe(a.paths[1]);
    expect(a.paths[1]).toBe(a.paths[2]);
  });
});
