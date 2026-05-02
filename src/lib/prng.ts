/**
 * Mulberry32 — fast 32-bit seeded PRNG. Returns a function that yields
 * deterministic floats in [0, 1) for a given seed.
 *
 * Used everywhere that randomness is needed in CONDUCTOR. Math.random()
 * is forbidden in this project: every roll must be reproducible from a
 * seed so artwork survives reload, theme change, and SVG export.
 */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function rand(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
