/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
};
