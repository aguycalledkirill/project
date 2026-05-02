import { useConductorStore } from '../store/useConductorStore';

export function ThemeToggle() {
  const theme = useConductorStore((s) => s.theme);
  const toggleTheme = useConductorStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-[30px] w-[30px] items-center justify-center border border-rule font-mono text-[14px] text-ink transition-colors hover:border-ink"
    >
      {theme === 'light' ? '☼' : '☾'}
    </button>
  );
}
