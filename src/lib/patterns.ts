import type { Vec2 } from './types';

export interface Pattern {
  label: string;
  description: string;
  beats: number;
  points: Vec2[];
}

export const PATTERNS = {
  '2/4': {
    label: '2/4',
    description: 'Down · Up',
    beats: 2,
    points: [
      [0, -0.85],
      [0, 0.85],
      [0.55, 0.45],
      [0.5, -0.65],
      [0, -0.85],
    ],
  },
  '3/4': {
    label: '3/4',
    description: 'Down · Out · Up',
    beats: 3,
    points: [
      [0, -0.85],
      [0, 0.85],
      [0.45, 0.65],
      [0.85, 0.35],
      [0.65, -0.4],
      [0, -0.85],
    ],
  },
  '4/4': {
    label: '4/4',
    description: 'Down · In · Out · Up',
    beats: 4,
    points: [
      [0, -0.85],
      [0, 0.85],
      [-0.65, 0.4],
      [0.75, 0.4],
      [0.45, -0.45],
      [0, -0.85],
    ],
  },
  '6/8': {
    label: '6/8',
    description: 'Compound · Two main beats',
    beats: 2,
    points: [
      [0, -0.85],
      [-0.2, 0.2],
      [0, 0.85],
      [0.3, 0.55],
      [0.65, 0.7],
      [0.55, -0.2],
      [0, -0.85],
    ],
  },
  '9/8': {
    label: '9/8',
    description: 'Compound triple · Three main beats',
    beats: 3,
    points: [
      [0, -0.85],
      [-0.1, -0.25],
      [-0.05, 0.4],
      [0, 0.85],
      [0.25, 0.75],
      [0.55, 0.6],
      [0.85, 0.35],
      [0.78, -0.05],
      [0.7, -0.4],
      [0, -0.85],
    ],
  },
  '12/8': {
    label: '12/8',
    description: 'Compound quadruple · Four main beats',
    beats: 4,
    points: [
      [0, -0.85],
      [-0.05, -0.25],
      [-0.05, 0.35],
      [0, 0.85],
      [-0.25, 0.7],
      [-0.5, 0.55],
      [-0.65, 0.4],
      [-0.2, 0.45],
      [0.4, 0.45],
      [0.75, 0.4],
      [0.65, 0.05],
      [0.55, -0.25],
      [0.45, -0.45],
      [0, -0.85],
    ],
  },
} as const satisfies Record<string, Pattern>;

export type Signature = keyof typeof PATTERNS;

export const SIGNATURES: Signature[] = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8'];
