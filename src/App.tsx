import { useEffect } from 'react';
import { AnimatedCanvas } from './components/AnimatedCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ExportButton } from './components/ExportButton';
import { StaticCanvas } from './components/StaticCanvas';
import { ThemeToggle } from './components/ThemeToggle';
import { useConductorStore } from './store/useConductorStore';

export default function App() {
  const theme = useConductorStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between border-b border-rule px-6 py-4 md:px-8">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-[24px] italic font-light tracking-[0.05em] text-ink">
            CONDUCTOR
          </h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50">
            v0.1
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ExportButton />
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[260px_1fr] md:px-8">
        <ControlPanel />
        <section className="relative flex w-full items-start justify-center">
          <div className="relative w-full max-w-[900px]">
            <StaticCanvas />
            <AnimatedCanvas />
          </div>
        </section>
      </main>
    </div>
  );
}
