export function exportSVG(svgEl: SVGSVGElement, filename: string): void {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.removeAttribute('id');

  const ink = getComputedStyle(svgEl).getPropertyValue('--ink').trim() || '#0A0A0A';

  const stripDataAttrs = (el: Element) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-')) el.removeAttribute(attr.name);
    }
  };

  // Strip the grid layer if present in the clone (export should never
  // bake the scaffolding into the artwork).
  const grid = clone.querySelector('[data-role="grid"]');
  if (grid) grid.remove();

  // Inline computed paint so the SVG renders correctly in tools that don't
  // resolve CSS custom properties (Figma, Illustrator).
  clone.querySelectorAll('path').forEach((p) => {
    p.setAttribute('stroke', ink);
    p.setAttribute('fill', 'none');
    if (!p.getAttribute('stroke-linecap')) p.setAttribute('stroke-linecap', 'round');
    if (!p.getAttribute('stroke-linejoin')) p.setAttribute('stroke-linejoin', 'round');
    stripDataAttrs(p);
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
}

export function exportFilename(signature: string, aspect: string, seed: number): string {
  const sig = signature.replace(/\//g, '-');
  const asp = aspect.replace(/:/g, 'x');
  return `conductor-${sig}-${asp}-${seed}.svg`;
}
