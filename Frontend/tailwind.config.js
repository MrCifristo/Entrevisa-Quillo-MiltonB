/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Tinta profunda (sidebar, texto fuerte) y lienzo salvia claro.
        ink: '#0B2027',
        canvas: '#EBF0EE',
        // Acción primaria: teal operativo.
        brand: {
          DEFAULT: '#0F766E',
          hover: '#0B5A53',
          soft: '#D2EFEA',
          ring: '#5EC6BB',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 32, 39, 0.06), 0 1px 3px rgba(11, 32, 39, 0.04)',
        pop: '0 10px 40px -12px rgba(11, 32, 39, 0.35)',
      },
    },
  },
  plugins: [],
};
