/**
 * Curated CONDUCTOR palettes. Every palette is a flat token set —
 * no gradients, no shadows, no glows — and ships a light + dark
 * variant. Token semantics match `src/index.css`:
 *   --paper  background colour
 *   --ink    primary stroke / text colour
 *   --rule   hairline divider colour (typically ink @ ~8% alpha)
 *   --accent the single non-ink hue used for the accent stroke
 */

export interface PaletteTokens {
  paper: string;
  ink: string;
  rule: string;
  accent: string;
}

export interface PaletteDefinition {
  light: PaletteTokens;
  dark: PaletteTokens;
}

export type PaletteName = 'Editorial' | 'Composer' | 'Score' | 'Manuscript';

export const PALETTES: Record<PaletteName, PaletteDefinition> = {
  Editorial: {
    light: {
      paper: '#F5F2ED',
      ink: '#0A0A0A',
      rule: 'rgba(10, 10, 10, 0.08)',
      accent: '#C73E1D',
    },
    dark: {
      paper: '#0E0E0E',
      ink: '#F5F2ED',
      rule: 'rgba(245, 242, 237, 0.10)',
      accent: '#E5613D',
    },
  },
  Composer: {
    light: {
      paper: '#F0E8DC',
      ink: '#101010',
      rule: 'rgba(16, 16, 16, 0.08)',
      accent: '#A23A1A',
    },
    dark: {
      paper: '#121008',
      ink: '#F0E8DC',
      rule: 'rgba(240, 232, 220, 0.10)',
      accent: '#D45A2F',
    },
  },
  Score: {
    light: {
      paper: '#EAE0CB',
      ink: '#2B2118',
      rule: 'rgba(43, 33, 24, 0.10)',
      accent: '#7A4A2A',
    },
    dark: {
      paper: '#161108',
      ink: '#EAE0CB',
      rule: 'rgba(234, 224, 203, 0.10)',
      accent: '#C7884F',
    },
  },
  Manuscript: {
    light: {
      paper: '#EFE8DD',
      ink: '#1B0F12',
      rule: 'rgba(27, 15, 18, 0.09)',
      accent: '#722F37',
    },
    dark: {
      paper: '#0F0507',
      ink: '#EFE8DD',
      rule: 'rgba(239, 232, 221, 0.10)',
      accent: '#B25862',
    },
  },
};

export const PALETTE_NAMES: PaletteName[] = ['Editorial', 'Composer', 'Score', 'Manuscript'];
