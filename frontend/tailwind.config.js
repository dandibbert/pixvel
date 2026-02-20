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
      boxShadow: {
        'none': '0 0 #0000',
      },
      borderRadius: {
        'md': '6px',
        'lg': '8px',
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
