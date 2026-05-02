import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { exportFilename, exportSVG } from '../lib/svgExport';
import { useConductorStore } from '../store/useConductorStore';

export function ExportButton() {
  const signature = useConductorStore((s) => s.signature);
  const aspect = useConductorStore((s) => s.aspect);
  const seed = useConductorStore((s) => s.seed);

  const [open, setOpen] = useState(false);
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includeMarkers, setIncludeMarkers] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onExport = () => {
    const svg = document.getElementById('conductor-svg');
    const ok = exportSVG(
      svg as SVGSVGElement | null,
      exportFilename(signature, aspect, seed),
      { includeGrid, includeMarkers },
    );
    if (ok) setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-ink px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <span aria-hidden>↓</span>
        <span>Export</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-[220px] border border-rule bg-paper p-3 shadow-none">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/60">
            Include
          </div>
          <label className="mb-2 flex cursor-pointer items-center justify-between font-mono text-[12px] text-ink">
            <span>Grid</span>
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
              className={clsx('h-3.5 w-3.5 cursor-pointer accent-current')}
            />
          </label>
          <label className="mb-3 flex cursor-pointer items-center justify-between font-mono text-[12px] text-ink">
            <span>Ictus markers</span>
            <input
              type="checkbox"
              checked={includeMarkers}
              onChange={(e) => setIncludeMarkers(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-current"
            />
          </label>
          <button
            type="button"
            onClick={onExport}
            className="w-full border border-ink px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Download SVG
          </button>
        </div>
      )}
    </div>
  );
}
