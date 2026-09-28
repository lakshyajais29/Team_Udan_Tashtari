/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070d',
        panel: '#0a0f1d',
        line: '#1a2440',
        cyan: { DEFAULT: '#22d3ee', glow: 'rgba(34,211,238,0.45)' },
        amber: { DEFAULT: '#f5a524' },
        muted: '#8a97b3',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px 2px rgba(34,211,238,0.45)',
        'glow-amber': '0 0 24px 2px rgba(245,165,36,0.45)',
      },
    },
  },
  plugins: [],
};
