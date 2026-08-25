import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: colors.violet,
        amber: colors.rose,
        sky: colors.fuchsia,
        'brand-primary-bg': 'var(--bg-primary)',
        'brand-secondary-bg': 'var(--bg-secondary)',
        'brand-headers': 'var(--text-headers)',
        'brand-body': 'var(--text-body)',
        'brand-muted': 'var(--text-muted)',
        'brand-cta': '#D4AF37', // Gold
        'brand-cta-hover-light': '#B89326', // Deep brass
        'brand-cta-text': '#1A1A1A',
        'brand-border': 'var(--border-color)',
        'brand-burgundy': '#5A1827',
      },
    },
  },
  plugins: [],
}