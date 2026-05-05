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

  // 9/8 — slow-tempo "in 9", subdivided. After Schroeder/Saito-style
  // textbook diagrams (cf. textbook Fig. 7): vertical SPINE down to the
  // downbeat, then a row of small dome SCALLOPS across the bottom (one
  // per eighth-note pulse), then small RISING TEETH up the right side
  // back to the prep. 9 pulses total: 1 downbeat + 5 lateral + 3 rising.
  //
  // Geometry rules used here:
  //   - Every bottom pulse sits on the line y = 0.85, evenly spaced
  //     (~0.20 apart) so each scallop is a clear dome of width ~0.20
  //     and height ~0.20 (peak at y = 0.65).
  //   - Bottom-row controls always bow upward to y = 0.65.
  //   - Rising teeth: each segment's controls are placed OUTSIDE the
  //     straight line between its ictuses (right of the line for an
  //     up-right-rising segment) so the segment reads as a distinct
  //     tooth with a corner at every ictus.
  '9/8': {
    label: '9/8',
    description: 'Subdivided · 9 eighth-note pulses',
    beats: 9,
    ictuses: [
      [0.0, -0.85], // K0 — prep top, start of loop
      [0.0, 0.85], // K1 — pulse 1, downbeat (spine base)
      [-0.22, 0.85], // K2 — pulse 2 (left scallop trough)
      [-0.42, 0.85], // K3 — pulse 3
      [-0.6, 0.85], // K4 — pulse 4 (leftmost)
      [-0.32, 0.85], // K5 — pulse 5 (turn-back arch trough)
      [-0.02, 0.85], // K6 — pulse 6 (back near center)
      [0.3, 0.85], // K7 — pulse 7 (right bottom)
      [0.55, 0.4], // K8 — pulse 8 (first rising tooth)
      [0.4, -0.4], // K9 — pulse 9 (final tooth, upper-right)
    ],
    controls: [
      // K0 → K1 — spine, straight down
      [0.0, -0.4],
      [0.0, 0.4],
      // K1 → K2 — bottom dome scallop (peak ~y 0.65)
      [-0.04, 0.65],
      [-0.18, 0.65],
      // K2 → K3
      [-0.26, 0.65],
      [-0.38, 0.65],
      // K3 → K4
      [-0.46, 0.65],
      [-0.56, 0.65],
      // K4 → K5 — turn-back arch (slightly taller, peak ~0.55)
      [-0.55, 0.55],
      [-0.37, 0.55],
      // K5 → K6
      [-0.27, 0.65],
      [-0.07, 0.65],
      // K6 → K7
      [0.04, 0.65],
      [0.24, 0.65],
      // K7 → K8 — transition arc up-and-right; controls right of line
      [0.42, 0.78],
      [0.6, 0.55],
      // K8 → K9 — rising tooth, controls bulged right of straight line
      [0.62, 0.18],
      [0.55, -0.2],
      // K9 → K0 — closing arc back to prep
      [0.25, -0.6],
      [0.08, -0.82],
    ],
  },

  // 12/8 — slow-tempo "in 12", subdivided. Same architectural shape as
  // the 9/8 subdivision (cf. textbook Fig. 8): vertical spine down to
  // the downbeat, scallops along the bottom going LEFT-then-RIGHT-back,
  // then rising teeth up to the upper-right closure. 12 pulses total:
  // 1 downbeat + 7 lateral (3 left + 1 turn + 3 right) + 4 rising.
  '12/8': {
    label: '12/8',
    description: 'Subdivided · 12 eighth-note pulses',
    beats: 12,
    ictuses: [
      [0.0, -0.85], // K0 — prep top
      [0.0, 0.85], // K1 — pulse 1, downbeat
      [-0.18, 0.85], // K2 — pulse 2 (left scallop 1)
      [-0.36, 0.85], // K3 — pulse 3
      [-0.55, 0.85], // K4 — pulse 4 (leftmost)
      [-0.3, 0.85], // K5 — pulse 5 (turn-back arch)
      [-0.05, 0.85], // K6 — pulse 6 (back through near-center)
      [0.2, 0.85], // K7 — pulse 7
      [0.45, 0.85], // K8 — pulse 8 (right bottom)
      [0.6, 0.5], // K9 — pulse 9 (first rising tooth)
      [0.65, 0.1], // K10 — pulse 10
      [0.55, -0.3], // K11 — pulse 11
      [0.35, -0.6], // K12 — pulse 12 (near top, upper-right)
    ],
    controls: [
      // K0 → K1 — spine
      [0.0, -0.4],
      [0.0, 0.4],
      // K1 → K2
      [-0.04, 0.65],
      [-0.14, 0.65],
      // K2 → K3
      [-0.22, 0.65],
      [-0.32, 0.65],
      // K3 → K4
      [-0.4, 0.65],
      [-0.51, 0.65],
      // K4 → K5 — turn-back arch (slightly taller)
      [-0.5, 0.55],
      [-0.35, 0.55],
      // K5 → K6
      [-0.25, 0.65],
      [-0.1, 0.65],
      // K6 → K7
      [-0.0, 0.65],
      [0.15, 0.65],
      // K7 → K8
      [0.25, 0.65],
      [0.4, 0.65],
      // K8 → K9 — transition into rise; controls right of straight line
      [0.55, 0.78],
      [0.65, 0.62],
      // K9 → K10 — rising tooth
      [0.7, 0.4],
      [0.72, 0.22],
      // K10 → K11
      [0.7, -0.05],
      [0.62, -0.2],
      // K11 → K12
      [0.55, -0.42],
      [0.45, -0.55],
      // K12 → K0 — closing arc to prep
      [0.2, -0.7],
      [0.06, -0.83],
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
