/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Bricolage Grotesque"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#2563EB',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          800: '#1e293b',
          900: '#0f172a',
        },
        ink: {
          primary:   '#0f172a',
          secondary: '#475569',
          muted:     '#94a3b8',
          inverse:   '#ffffff',
        },
        positive: '#10b981',
        negative: '#ef4444',
        warning:  '#f59e0b',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':'0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        'modal':  '0 20px 60px rgba(0,0,0,0.18)',
        'brand':  '0 4px 14px rgba(37,99,235,0.35)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-in':   'slideIn 0.35s ease both',
        'spin-slow':  'spin 2s linear infinite',
        'pulse-dot':  'pulseDot 1.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeUp:   { from:{ opacity:0, transform:'translateY(12px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:   { from:{ opacity:0 }, to:{ opacity:1 } },
        slideIn:  { from:{ opacity:0, transform:'translateX(-8px)' }, to:{ opacity:1, transform:'translateX(0)' } },
        pulseDot: { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.3 } },
        shimmer:  { from:{ backgroundPosition:'-400px 0' }, to:{ backgroundPosition:'400px 0' } },
      },
    },
  },
  plugins: [],
}
