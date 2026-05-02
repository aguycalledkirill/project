import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { PATTERNS } from '../lib/patterns';
import { translate } from '../lib/translator';
import type { Vec2 } from '../lib/types';
import type { Aspect } from '../store/useConductorStore';
import { useConductorStore } from '../store/useConductorStore';

const ASPECT_CLASS: Record<Aspect, string> = {
  '1:1': 'aspect-square',
  '3:1': 'aspect-[3/1]',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
};

const GRID_DOTS = 24;
const SPINE_BASE: Vec2 = [0, 0.85];
const ORIGIN: Vec2 = [0, 0];
const MARKER_HALF_LEN = 0.022; // viewBox-units half-length of each marker arm

interface StaticCanvasProps {
  className?: string;
}

export const StaticCanvas = forwardRef<SVGSVGElement, StaticCanvasProps>(
  function StaticCanvas({ className }, ref) {
    const signature = useConductorStore((s) => s.signature);
    const iterations = useConductorStore((s) => s.iterations);
    const variation = useConductorStore((s) => s.variation);
    const spread = useConductorStore((s) => s.spread);
    const scale = useConductorStore((s) => s.scale);
    const articulation = useConductorStore((s) => s.articulation);
    const pivotMode = useConductorStore((s) => s.pivot);
    const strokeWidth = useConductorStore((s) => s.strokeWidth);
    const seed = useConductorStore((s) => s.seed);
    const aspect = useConductorStore((s) => s.aspect);
    const showGrid = useConductorStore((s) => s.showGrid);
    const showIctusMarkers = useConductorStore((s) => s.showIctusMarkers);
    const accentLast = useConductorStore((s) => s.accentLast);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [canvasPx, setCanvasPx] = useState(720);

    useEffect(() => {
      const el = wrapperRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setCanvasPx(Math.max(1, Math.min(width, height)));
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const pattern = PATTERNS[signature];
    const pivot: Vec2 = pivotMode === 'spineBase' ? SPINE_BASE : ORIGIN;

    const output = useMemo(
      () =>
        translate({
          ictuses: pattern.ictuses,
          controls: pattern.controls,
          iterations,
          variation,
          spread,
          scale,
          articulation,
          pivot,
          seed,
        }),
      [pattern, iterations, variation, spread, scale, articulation, pivot, seed],
    );

    const vbStrokeWidth = (strokeWidth / canvasPx) * 2;

    const gridDots = useMemo(() => {
      if (!showGrid) return null;
      const dots: { x: number; y: number }[] = [];
      const step = 2 / (GRID_DOTS - 1);
      for (let i = 0; i < GRID_DOTS; i++) {
        for (let j = 0; j < GRID_DOTS; j++) {
          dots.push({ x: -1 + i * step, y: -1 + j * step });
        }
      }
      return dots;
    }, [showGrid]);

    return (
      <div
        ref={wrapperRef}
        className={clsx(
          'canvas-stage relative w-full max-w-full bg-paper',
          ASPECT_CLASS[aspect],
          className,
        )}
        style={{ maxHeight: '85vh' }}
      >
        <svg
          ref={ref}
          id="conductor-svg"
          viewBox="-1 -1 2 2"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full"
        >
          {gridDots && (
            <g data-role="grid" fill="var(--ink)" opacity={0.05}>
              {gridDots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={0.005} />
              ))}
            </g>
          )}
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={vbStrokeWidth}
          >
            {output.paths.map((d, i) => {
              const isAccent = accentLast && i === output.paths.length - 1;
              return (
                <path
                  key={i}
                  d={d}
                  stroke={isAccent ? 'var(--accent)' : 'var(--ink)'}
                />
              );
            })}
          </g>
          {showIctusMarkers && (
            <g
              data-role="markers"
              stroke="var(--ink)"
              strokeWidth={vbStrokeWidth}
              strokeLinecap="round"
            >
              {pattern.ictuses.map((p, i) => (
                <g key={i}>
                  <line
                    x1={p[0] - MARKER_HALF_LEN}
                    y1={p[1]}
                    x2={p[0] + MARKER_HALF_LEN}
                    y2={p[1]}
                  />
                  <line
                    x1={p[0]}
                    y1={p[1] - MARKER_HALF_LEN}
                    x2={p[0]}
                    y2={p[1] + MARKER_HALF_LEN}
                  />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
    );
  },
);
