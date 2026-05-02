import clsx from 'clsx';
import { PATTERNS, SIGNATURES } from '../lib/patterns';
import { PALETTES, PALETTE_NAMES } from '../lib/palettes';
import type { Aspect, Pivot } from '../store/useConductorStore';
import { useConductorStore } from '../store/useConductorStore';

const ASPECTS: Aspect[] = ['1:1', '3:1', '4:5', '9:16'];
const PIVOTS: { value: Pivot; label: string }[] = [
  { value: 'origin', label: 'Origin' },
  { value: 'spineBase', label: 'Spine' },
];

const labelClass =
  "font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink";
const valueClass = 'font-mono text-[12px] text-ink/80 tabular-nums text-right';

function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function Header({ title, value }: { title: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={labelClass}>{title}</span>
      {value !== undefined && <span className={valueClass}>{value}</span>}
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'h-3.5 w-3.5 border border-ink transition-colors duration-150',
        checked ? 'bg-ink' : 'bg-transparent',
      )}
    />
  );
}

export function ControlPanel() {
  const s = useConductorStore();

  return (
    <aside className="flex flex-col gap-8 border-rule pr-0 md:border-r md:pr-8">
      <Section>
        <Header title="Meter" />
        <div className="flex flex-col gap-2">
          {SIGNATURES.map((sig) => {
            const pattern = PATTERNS[sig];
            const active = s.signature === sig;
            return (
              <button
                key={sig}
                type="button"
                onClick={() => s.setSignature(sig)}
                className="group flex items-center gap-3 text-left"
              >
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full border border-ink transition-colors',
                    active ? 'bg-ink' : 'bg-transparent',
                  )}
                />
                <span className={clsx('font-mono text-[12px] tracking-[0.06em] text-ink')}>
                  {pattern.label}
                </span>
                <span className="font-display text-[12px] italic font-light text-ink/60">
                  {pattern.description}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section>
        <Header title="Iterations" value={String(s.iterations)} />
        <Slider min={1} max={80} step={1} value={s.iterations} onChange={s.setIterations} />
      </Section>

      <Section>
        <Header title="Spread (°)" value={s.spread.toFixed(0)} />
        <Slider min={0} max={120} step={1} value={s.spread} onChange={s.setSpread} />
      </Section>

      <Section>
        <Header title="Pivot" />
        <div className="grid grid-cols-2 gap-2">
          {PIVOTS.map((p) => {
            const active = s.pivot === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => s.setPivot(p.value)}
                className={clsx(
                  'border px-3 py-1.5 font-mono text-[12px] tracking-[0.06em] transition-colors',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-ink hover:border-ink',
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section>
        <Header title="Scale" value={s.scale.toFixed(2)} />
        <Slider min={0} max={0.6} step={0.01} value={s.scale} onChange={s.setScale} />
      </Section>

      <Section>
        <Header title="Articulation" value={s.articulation.toFixed(2)} />
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={s.articulation}
          onChange={s.setArticulation}
        />
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
          <span>Staccato</span>
          <span>Legato</span>
        </div>
      </Section>

      <Section>
        <Header title="Variation" value={s.variation.toFixed(2)} />
        <Slider min={0} max={0.3} step={0.01} value={s.variation} onChange={s.setVariation} />
      </Section>

      <Section>
        <Header title="Stroke" value={s.strokeWidth.toFixed(2)} />
        <Slider
          min={0.25}
          max={4}
          step={0.05}
          value={s.strokeWidth}
          onChange={s.setStrokeWidth}
        />
      </Section>

      <Section>
        <Header title="Tempo (bpm)" value={String(s.tempo)} />
        <Slider min={30} max={200} step={1} value={s.tempo} onChange={s.setTempo} />
      </Section>

      <Section>
        <Header title="Aspect" />
        <div className="grid grid-cols-2 gap-2">
          {ASPECTS.map((a) => {
            const active = s.aspect === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => s.setAspect(a)}
                className={clsx(
                  'border px-3 py-1.5 font-mono text-[12px] tracking-[0.06em] transition-colors',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-ink hover:border-ink',
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </Section>

      <Section>
        <Header title="Seed" />
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={s.seed}
            onChange={(e) => s.setSeed(Number(e.target.value) || 0)}
          />
          <button
            type="button"
            onClick={s.rerollSeed}
            aria-label="Reroll seed"
            className="flex h-[30px] w-[30px] flex-none items-center justify-center border border-rule font-mono text-[14px] text-ink hover:border-ink"
          >
            ⟳
          </button>
        </div>
      </Section>

      <Section>
        <Header title="Palette" />
        <div className="flex flex-col gap-2">
          {PALETTE_NAMES.map((name) => {
            const tokens = PALETTES[name][s.theme];
            const active = s.palette === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => s.setPalette(name)}
                className={clsx(
                  'flex items-center gap-3 border px-2 py-1.5 text-left transition-colors',
                  active ? 'border-ink' : 'border-rule hover:border-ink',
                )}
              >
                <span
                  aria-hidden
                  className="flex h-4 w-10 flex-none overflow-hidden border border-rule"
                >
                  <span style={{ backgroundColor: tokens.paper, flex: 1 }} />
                  <span style={{ backgroundColor: tokens.ink, flex: 1 }} />
                  <span style={{ backgroundColor: tokens.accent, flex: 1 }} />
                </span>
                <span className="font-mono text-[12px] tracking-[0.06em] text-ink">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="flex items-center justify-between">
          <span className={labelClass}>Grid</span>
          <Checkbox checked={s.showGrid} onChange={s.setShowGrid} />
        </div>
        <div className="flex items-center justify-between">
          <span className={labelClass}>Markers</span>
          <Checkbox
            checked={s.showIctusMarkers}
            onChange={s.setShowIctusMarkers}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={labelClass}>Animation</span>
          <Checkbox checked={s.animation} onChange={s.setAnimation} />
        </div>
        <div className="flex items-center justify-between">
          <span className={labelClass}>Accent</span>
          <Checkbox checked={s.accentLast} onChange={s.setAccentLast} />
        </div>
      </Section>
    </aside>
  );
}
