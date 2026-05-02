import { exportFilename, exportSVG } from '../lib/svgExport';
import { useConductorStore } from '../store/useConductorStore';

export function ExportButton() {
  const signature = useConductorStore((s) => s.signature);
  const aspect = useConductorStore((s) => s.aspect);
  const seed = useConductorStore((s) => s.seed);

  const onClick = () => {
    const svg = document.getElementById('conductor-svg') as SVGSVGElement | null;
    if (!svg) return;
    exportSVG(svg, exportFilename(signature, aspect, seed));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 border border-ink px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      <span aria-hidden>↓</span>
      <span>Export</span>
    </button>
  );
}
