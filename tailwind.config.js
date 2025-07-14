/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'closetly': {
          primary: '#8b5cf6',
          'primary-light': '#a78bfa',
          'primary-dark': '#7c3aed',
          accent: '#f3f4f6',
          white: '#ffffff',
        }
      },
    },
  },
  plugins: [],
} 