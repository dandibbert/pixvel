/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#0096fa', // Pixiv Blue
        'secondary': '#10B981', // Emerald 500
        'accent': '#F59E0B', // Amber 500
        'muted': '#F3F4F6', // Gray 100
        'foreground': '#111827', // Gray 900
        'border': '#E5E7EB', // Gray 200
        'warm-gray': '#f8f7f4',
        'near-black': '#2a2a2a',
        'pixiv-blue': '#0096fa',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif JP', 'serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      screens: {
        'xs': '480px',
      },
      lineHeight: {
        'reading': '1.8',
      },
      spacing: {
        'paragraph': '1.5rem',
      },
    },
  },
  plugins: [],
}
