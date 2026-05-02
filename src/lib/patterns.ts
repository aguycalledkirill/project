import type { Vec2 } from './types';

/**
 * Conducting beat patterns — precise geometry, cubic Bezier edition.
 *
 * Coordinate system: x in [-1, 1], y in [-1, 1], y-DOWN (canvas convention).
 * Origin (0, 0) is centered. The conductor's RIGHT is +x; LEFT is -x.
 * UP is -y; DOWN is +y. Beat 1 (downbeat) lands at +y.
 *
 * Pattern data:
 *   - `ictuses[i]`: position of the i-th ictus (sharp corner / beat point)
 *   - `controls[2i]`:    OUTGOING cubic-Bezier control just after ictuses[i]
 *   - `controls[2i+1]`:  INCOMING cubic-Bezier control just before
 *                         ictuses[(i+1) mod n]
 *
 * The path is a closed loop of n cubic Bezier segments. Each segment runs
 * from ictus[i] through controls[2i] and controls[2i+1] to ictus[i+1].
 *
 * Articulation interpolates each control toward its anchor ictus:
 *   - 0  → controls collapse, segments become straight lines (staccato)
 *   - 1  → controls at full positions, smooth Bezier curves (legato)
 *
 * References: The Concert Band; Pressbooks "Music in Motion" chapters 2 & 6;
 * ConductIT; Saito conducting method (tataki / shakui / haneage).
 */
export interface Pattern {
  label: string;
  description: string;
  beats: number;
  ictuses: Vec2[];
  controls: Vec2[];
}

export const PATTERNS = {
  // 1/4 — "In 1". Single beat per measure (very fast pieces, scherzo,
  // some waltzes conducted as one). Geometry: a tall, narrow pendulum
  // with the ictus at the bottom and a clean prep at the top. The
  // descent and rise are mirrored gentle arcs that read as a single
  // breath of motion.
  '1/4': {
    label: '1/4',
    description: 'In 1 · Single beat',
    beats: 1,
    ictuses: [
      [0.0, 0.7],
      [0.0, -0.7],
    ],
    controls: [
      [0.12, 0.4],
      [0.12, -0.4],
      [-0.12, -0.4],
      [-0.12, 0.4],
    ],
  },

  // 2/4 — duple simple. Down · Up. The right-rebound trait of 2/4 is encoded
  // by both controls of the I1→I2 segment sitting on the right side of the
  // path; the I2→I1 return arc is a smaller leftward bulge.
  '2/4': {
    label: '2/4',
    description: 'Duple · Down · Up',
    beats: 2,
    ictuses: [
      [0.0, 0.7],
      [0.0, -0.7],
    ],
    controls: [
      [0.55, 0.5],
      [0.55, -0.5],
      [-0.18, -0.4],
      [-0.18, 0.4],
    ],
  },

  // 3/4 — triple simple. Triangle: Down · Out · Up. Downbeat slightly lower
  // than I2 for prominence; I2→I3 sweeps far up-and-right; the return arc
  // bows gently to the left.
  '3/4': {
    label: '3/4',
    description: 'Triple · Down · Out · Up',
    beats: 3,
    ictuses: [
      [0.0, 0.7],
      [0.65, 0.5],
      [0.0, -0.7],
    ],
    controls: [
      [0.18, 0.72],
      [0.5, 0.6],
      [0.78, 0.18],
      [0.45, -0.55],
      [-0.2, -0.45],
      [-0.18, 0.4],
    ],
  },

  // 4/4 — quadruple simple. Down · In · Out · Up. Beats 1, 2, 3 share the
  // low plane (y ≈ 0.55–0.7). Beat 2 (left) and Beat 3 (right) are linked
  // by an arc that bulges UP over center. Beat 4 is the upbeat at top.
  '4/4': {
    label: '4/4',
    description: 'Quadruple · Down · In · Out · Up',
    beats: 4,
    ictuses: [
      [0.0, 0.7],
      [-0.65, 0.55],
      [0.65, 0.55],
      [0.0, -0.7],
    ],
    controls: [
      [-0.22, 0.7],
      [-0.5, 0.62],
      [-0.4, 0.2],
      [0.4, 0.2],
      [0.7, 0.1],
      [0.35, -0.55],
      [-0.18, -0.45],
      [-0.18, 0.4],
    ],
  },

  // 5/4 — asymmetric "In 5", grouped 3+2. The first three beats trace a
  // 4/4-like in/out cross, then beats 4 and 5 form a smaller down-up
  // pair on the right — the iconic "Take Five" shape: cross plus tail.
  '5/4': {
    label: '5/4',
    description: 'Asymmetric · 3 + 2',
    beats: 5,
    ictuses: [
      [0.0, 0.7],
      [-0.55, 0.55],
      [0.55, 0.55],
      [0.55, 0.1],
      [0.0, -0.7],
    ],
    controls: [
      [-0.18, 0.7],
      [-0.45, 0.62],
      [-0.4, 0.18],
      [0.4, 0.18],
      [0.7, 0.42],
      [0.6, 0.18],
      [0.5, -0.05],
      [0.2, -0.55],
      [-0.18, -0.45],
      [-0.18, 0.4],
    ],
  },

  // 7/8 — asymmetric "In 3", grouped 3+2+2. Triangle skeleton with
  // beat 1's segment carrying a longer, lazier swing (the three-eighth
  // pulse), while beats 2 and 3 are tighter, more direct arcs (each
  // two-eighths). Reads as an off-balance triangle.
  '7/8': {
    label: '7/8',
    description: 'Asymmetric · 3 + 2 + 2',
    beats: 3,
    ictuses: [
      [0.0, 0.7],
      [0.55, 0.4],
      [0.0, -0.7],
    ],
    controls: [
      [0.1, 0.78],
      [0.5, 0.62],
      [0.7, 0.1],
      [0.4, -0.5],
      [-0.18, -0.45],
      [-0.18, 0.4],
    ],
  },

  // 6/8 — compound duple. Two main pulses, three eighth-notes each. Modeled
  // as a 2/4 skeleton with one subsidiary flick midway through each big
  // sweep — a single mid-arc ictus that hints at the three-eighth feel
  // without breaking the smoothness.
  '6/8': {
    label: '6/8',
    description: 'Compound duple · Two main pulses',
    beats: 2,
    ictuses: [
      [0.0, 0.7],
      [0.55, 0.05],
      [0.0, -0.7],
      [-0.18, 0.05],
    ],
    controls: [
      [0.4, 0.6],
      [0.6, 0.4],
      [0.5, -0.3],
      [0.25, -0.55],
      [-0.15, -0.55],
      [-0.22, -0.3],
      [-0.2, 0.35],
      [-0.1, 0.6],
    ],
  },

  // 9/8 — compound triple. Three main pulses (triangle skeleton) with one
  // subsidiary flick on each main arc. The shape is a soft scalloped
  // triangle — clearly three large pulses, each with its own gentle hump.
  '9/8': {
    label: '9/8',
    description: 'Compound triple · Three main pulses',
    beats: 3,
    ictuses: [
      [0.0, 0.7],
      [0.4, 0.55],
      [0.65, 0.5],
      [0.6, 0.0],
      [0.0, -0.7],
      [-0.15, 0.05],
    ],
    controls: [
      [0.18, 0.72],
      [0.32, 0.6],
      [0.5, 0.55],
      [0.62, 0.5],
      [0.72, 0.35],
      [0.65, 0.15],
      [0.55, -0.2],
      [0.3, -0.6],
      [-0.18, -0.55],
      [-0.2, -0.3],
      [-0.18, 0.35],
      [-0.08, 0.6],
    ],
  },

  // 12/8 — compound quadruple. Four main pulses (4/4 skeleton). Each big
  // arc carries a subtle flick at its midpoint to suggest the three-eighth
  // subdivision feel without cluttering the figure. Reads architecturally
  // like a 4-pattern with bounce.
  '12/8': {
    label: '12/8',
    description: 'Compound quadruple · Four main pulses',
    beats: 4,
    ictuses: [
      [0.0, 0.7],
      [-0.4, 0.65],
      [-0.65, 0.55],
      [0.0, 0.35],
      [0.65, 0.55],
      [0.55, 0.0],
      [0.0, -0.7],
      [-0.18, 0.05],
    ],
    controls: [
      [-0.15, 0.72],
      [-0.28, 0.7],
      [-0.5, 0.62],
      [-0.6, 0.58],
      [-0.5, 0.4],
      [-0.2, 0.35],
      [0.2, 0.35],
      [0.5, 0.4],
      [0.7, 0.45],
      [0.65, 0.25],
      [0.6, -0.15],
      [0.35, -0.55],
      [-0.18, -0.55],
      [-0.22, -0.3],
      [-0.2, 0.35],
      [-0.1, 0.6],
    ],
  },
} as const satisfies Record<string, Pattern>;

export type Signature = keyof typeof PATTERNS;

export const SIGNATURES: Signature[] = [
  '1/4',
  '2/4',
  '3/4',
  '4/4',
  '5/4',
  '6/8',
  '7/8',
  '9/8',
  '12/8',
];
