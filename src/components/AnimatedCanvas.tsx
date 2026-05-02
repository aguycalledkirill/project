import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { PATTERNS } from '../lib/patterns';
import { catmullRomToBezier } from '../lib/catmull';
import { useConductorStore } from '../store/useConductorStore';

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function AnimatedCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animation = useConductorStore((s) => s.animation);
  const signature = useConductorStore((s) => s.signature);
  const tempo = useConductorStore((s) => s.tempo);
  const smoothing = useConductorStore((s) => s.smoothing);
  const strokeWidth = useConductorStore((s) => s.strokeWidth);
  const theme = useConductorStore((s) => s.theme);

  useEffect(() => {
    if (!animation) return;
    const container = containerRef.current;
    if (!container) return;

    const pattern = PATTERNS[signature];
    const d = catmullRomToBezier(
      pattern.points as unknown as [number, number][],
      smoothing,
    );

    let samples: { x: number; y: number }[] = [];
    let totalLength = 0;

    // Sample the path geometry once with a hidden SVG path element. This
    // avoids re-implementing bezier arc-length math in p5 land.
    const svgNS = 'http://www.w3.org/2000/svg';
    const tmpSvg = document.createElementNS(svgNS, 'svg');
    tmpSvg.setAttribute('viewBox', '-1 -1 2 2');
    tmpSvg.style.position = 'absolute';
    tmpSvg.style.opacity = '0';
    tmpSvg.style.pointerEvents = 'none';
    const tmpPath = document.createElementNS(svgNS, 'path');
    tmpPath.setAttribute('d', d);
    tmpSvg.appendChild(tmpPath);
    document.body.appendChild(tmpSvg);
    totalLength = tmpPath.getTotalLength();
    const SAMPLE_COUNT = 600;
    samples = Array.from({ length: SAMPLE_COUNT }, (_, i) => {
      const pt = tmpPath.getPointAtLength((i / (SAMPLE_COUNT - 1)) * totalLength);
      return { x: pt.x, y: pt.y };
    });
    document.body.removeChild(tmpSvg);

    let paper = readToken('--paper', '#F5F2ED');
    let ink = readToken('--ink', '#0A0A0A');
    let cycle = 0;

    const sketch = (p: p5) => {
      let w = container.clientWidth;
      let h = container.clientHeight;

      const toScreen = (vx: number, vy: number): [number, number] => {
        const size = Math.min(w, h);
        const cx = w / 2;
        const cy = h / 2;
        return [cx + (vx * size) / 2, cy + (vy * size) / 2];
      };

      p.setup = () => {
        const canvas = p.createCanvas(w, h);
        canvas.elt.style.display = 'block';
        p.frameRate(60);
        p.background(paper);
      };

      p.windowResized = () => {
        w = container.clientWidth;
        h = container.clientHeight;
        p.resizeCanvas(w, h);
        p.background(paper);
      };

      p.draw = () => {
        // Re-read tokens each frame so theme changes propagate.
        paper = readToken('--paper', '#F5F2ED');
        ink = readToken('--ink', '#0A0A0A');

        // Trail fade — draw a translucent paper-color rect over everything.
        const c = p.color(paper);
        c.setAlpha(28);
        p.noStroke();
        p.fill(c);
        p.rect(0, 0, w, h);

        // Advance parametric t at tempo. One full pattern = pattern.beats.
        const dt = tempo / 60 / pattern.beats / 60;
        cycle = (cycle + dt) % 1;

        // Window of samples to draw (~last 25% of the cycle).
        const windowFrac = 0.25;
        const headIdx = Math.floor(cycle * (samples.length - 1));
        const tailIdx = Math.max(0, headIdx - Math.floor(windowFrac * samples.length));

        const inkPx = (strokeWidth * Math.min(w, h)) / Math.min(w, h);
        p.stroke(ink);
        p.strokeWeight(inkPx * 1.5);
        p.noFill();
        p.beginShape();
        for (let i = tailIdx; i <= headIdx; i++) {
          const s = samples[i];
          const [sx, sy] = toScreen(s.x, s.y);
          p.vertex(sx, sy);
        }
        p.endShape();

        // Baton tip — a small filled dot at the head.
        const head = samples[headIdx];
        const [hx, hy] = toScreen(head.x, head.y);
        p.noStroke();
        p.fill(ink);
        p.circle(hx, hy, 6);
      };
    };

    const instance = new p5(sketch, container);

    return () => {
      instance.remove();
    };
  }, [animation, signature, tempo, smoothing, strokeWidth, theme]);

  if (!animation) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
      }}
    />
  );
}
