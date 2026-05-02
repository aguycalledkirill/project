import type { Vec2 } from './types';

/**
 * Conducting beat patterns — precise geometry.
 *
 * Coordinate system: x in [-1, 1], y in [-1, 1], y-DOWN (canvas convention).
 * Origin (0, 0) is centered. The conductor's RIGHT (outward) is +x; the
 * conductor's LEFT (inward) is -x. UP is -y, DOWN is +y. So ictus 1 (the
 * downbeat) lands at +y.
 *
 * Each pattern is described by:
 *   - `ictuses` — the sharp direction changes the baton passes through, in
 *     order. The first ictus is beat 1 (downbeat). The path is drawn as a
 *     CLOSED loop: after the last ictus it returns to the first.
 *   - `controls` — one quadratic Bezier control point per gap between
 *     consecutive ictuses (wrapping). A control point further from the
 *     line between its two ictuses produces a stronger rebound arc.
 *
 * The ictus is rendered as a sharp corner because two Bezier segments meet
 * there at different tangents. Between ictuses, the path is a smooth arc.
 *
 * References:
 *   - The Concert Band, "Basic Patterns" (theconcertband.com)
 *   - Pressbooks "Music in Motion", Ch. 2 Basic Beat Patterns
 *   - ConductIT, "The problem of conducting in 2 and simple/compound patterns"
 *   - Elizabeth Green, "The Modern Conductor" — standard-school patterns
 */
export interface Pattern {
  label: string;
  description: string;
  beats: number;
  ictuses: Vec2[];
  controls: Vec2[];
}

export const PATTERNS = {
  // 2/4 — duple simple. Down · Up with a wide right-rebound arc on the
  // ascent (the characteristic 2/4 trait that prevents beats 1 and 2 from
  // looking identical) and a narrower left-arc return.
  '2/4': {
    label: '2/4',
    description: 'Duple · Down · Up',
    beats: 2,
    ictuses: [
      [0.0, 0.7],
      [0.0, -0.7],
    ],
    controls: [
      [0.55, 0.0],
      [-0.18, 0.0],
    ],
  },

  // 3/4 — triple simple. Triangle: Down · Out · Up. The downbeat ictus sits
  // slightly lower than the second ictus so the downbeat reads as the most
  // prominent corner.
  '3/4': {
    label: '3/4',
    description: 'Triple · Down · Out · Up',
    beats: 3,
    ictuses: [
      [0.0, 0.7],
      [0.7, 0.5],
      [0.0, -0.7],
    ],
    controls: [
      [0.18, 0.7],
      [0.7, -0.05],
      [-0.18, 0.0],
    ],
  },

  // 4/4 — quadruple simple. Down · In · Out · Up. Beats 2 and 3 sit on a
  // shared low horizontal plane just above the downbeat; beat 4 is the
  // upbeat at high-center, which doubles as the prep for the next downbeat.
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
      [-0.22, 0.42],
      [0.0, 0.28],
      [0.5, 0.0],
      [-0.18, -0.1],
    ],
  },

  // 6/8 — compound duple. Two main pulses, each subdivided into three
  // eighth-notes. Geometry: a 2/4 skeleton with two "subsidiary flicks"
  // per main beat that gently break the descent and ascent — the
  // pendulum-with-bounce shape that distinguishes 6/8 from 2/4 visually.
  '6/8': {
    label: '6/8',
    description: 'Compound duple · Two main pulses',
    beats: 2,
    ictuses: [
      [0.0, 0.7],
      [0.42, 0.32],
      [0.5, -0.05],
      [0.0, -0.7],
      [-0.18, -0.32],
      [-0.12, 0.05],
    ],
    controls: [
      [0.22, 0.58],
      [0.55, 0.18],
      [0.42, -0.42],
      [-0.1, -0.55],
      [-0.2, -0.15],
      [-0.05, 0.42],
    ],
  },

  // 9/8 — compound triple. Three main pulses (triangle skeleton) with
  // two subsidiary flicks per main pulse. Each main ictus is approached
  // with a slight kink that reads as the third-eighth subdivision.
  '9/8': {
    label: '9/8',
    description: 'Compound triple · Three main pulses',
    beats: 3,
    ictuses: [
      [0.0, 0.7],
      [0.18, 0.45],
      [0.42, 0.55],
      [0.7, 0.5],
      [0.62, 0.18],
      [0.55, -0.18],
      [0.0, -0.7],
      [-0.15, -0.3],
      [-0.12, 0.1],
    ],
    controls: [
      [0.05, 0.6],
      [0.28, 0.4],
      [0.6, 0.6],
      [0.7, 0.32],
      [0.62, 0.0],
      [0.4, -0.4],
      [-0.08, -0.55],
      [-0.18, -0.1],
      [-0.05, 0.45],
    ],
  },

  // 12/8 — compound quadruple. Four main pulses (a 4/4 skeleton) with
  // two subsidiary flicks per main pulse. The pattern is wide and
  // architectural; reads as a 4-pattern with bounce.
  '12/8': {
    label: '12/8',
    description: 'Compound quadruple · Four main pulses',
    beats: 4,
    ictuses: [
      [0.0, 0.7],
      [-0.25, 0.42],
      [-0.5, 0.5],
      [-0.65, 0.55],
      [-0.4, 0.4],
      [-0.05, 0.4],
      [0.35, 0.4],
      [0.65, 0.55],
      [0.55, 0.18],
      [0.45, -0.2],
      [0.0, -0.7],
      [-0.15, -0.32],
      [-0.1, 0.08],
    ],
    controls: [
      [-0.08, 0.6],
      [-0.38, 0.4],
      [-0.6, 0.55],
      [-0.55, 0.5],
      [-0.22, 0.45],
      [0.15, 0.35],
      [0.5, 0.45],
      [0.65, 0.32],
      [0.5, 0.0],
      [0.3, -0.45],
      [-0.08, -0.55],
      [-0.18, -0.12],
      [-0.05, 0.42],
    ],
  },
} as const satisfies Record<string, Pattern>;

export type Signature = keyof typeof PATTERNS;

export const SIGNATURES: Signature[] = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8'];
