import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { PATTERNS } from '../lib/patterns';
import { translate } from '../lib/translator';
import type { Aspect } from '../store/useConductorStore';
import { useConductorStore } from '../store/useConductorStore';

const ASPECT_CLASS: Record<Aspect, string> = {
  '1:1': 'aspect-square',
  '3:1': 'aspect-[3/1]',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
};

const GRID_DOTS = 24;

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
    const strokeWidth = useConductorStore((s) => s.strokeWidth);
    const seed = useConductorStore((s) => s.seed);
    const aspect = useConductorStore((s) => s.aspect);
    const showGrid = useConductorStore((s) => s.showGrid);
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

    const output = useMemo(() => {
      const pattern = PATTERNS[signature];
      return translate({
        ictuses: pattern.ictuses as unknown as [number, number][],
        controls: pattern.controls as unknown as [number, number][],
        iterations,
        variation,
        spread,
        scale,
        seed,
      });
    }, [signature, iterations, variation, spread, scale, seed]);

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
                  strokeWidth={isAccent ? vbStrokeWidth * 1.4 : vbStrokeWidth}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  },
);
