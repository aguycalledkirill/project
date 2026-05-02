export interface ExportOptions {
  includeGrid?: boolean;
  includeMarkers?: boolean;
}

export function exportSVG(
  svgEl: SVGSVGElement | null,
  filename: string,
  opts: ExportOptions = {},
): boolean {
  if (!svgEl) return false;
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.removeAttribute('id');

  const computed = getComputedStyle(svgEl);
  const ink = computed.getPropertyValue('--ink').trim() || '#0A0A0A';
  const accent = computed.getPropertyValue('--accent').trim() || '#C73E1D';

  const stripDataAttrs = (el: Element) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-')) el.removeAttribute(attr.name);
    }
  };

  if (!opts.includeGrid) {
    clone.querySelector('[data-role="grid"]')?.remove();
  }
  if (!opts.includeMarkers) {
    clone.querySelector('[data-role="markers"]')?.remove();
  }

  // Inline computed paint so Figma / Illustrator render correctly without
  // resolving CSS custom properties. Preserve any explicit accent stroke
  // by detecting var(--accent) refs.
  clone.querySelectorAll('path, line, circle').forEach((el) => {
    const stroke = el.getAttribute('stroke');
    if (stroke && stroke.includes('--accent')) el.setAttribute('stroke', accent);
    else if (stroke && stroke.includes('--ink')) el.setAttribute('stroke', ink);
    else if (!stroke && el.tagName.toLowerCase() === 'path') el.setAttribute('stroke', ink);

    const fill = el.getAttribute('fill');
    if (fill && fill.includes('--ink')) el.setAttribute('fill', ink);

    if (el.tagName.toLowerCase() === 'path') {
      if (!el.getAttribute('fill')) el.setAttribute('fill', 'none');
      if (!el.getAttribute('stroke-linecap')) el.setAttribute('stroke-linecap', 'round');
      if (!el.getAttribute('stroke-linejoin')) el.setAttribute('stroke-linejoin', 'round');
    }
  });

  stripDataAttrs(clone);
  clone.querySelectorAll('*').forEach(stripDataAttrs);

  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export function exportFilename(signature: string, aspect: string, seed: number): string {
  const sig = signature.replace(/\//g, '-');
  const asp = aspect.replace(/:/g, 'x');
  return `conductor-${sig}-${asp}-${seed}.svg`;
}
