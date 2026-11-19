/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4E2284',
          hover: '#3f1a6e',
          light: '#f5f0fc',
          border: '#e4d5f7',
        },
        brand: {
          50: '#f6f2fc',
          100: '#ede5f9',
          200: '#dccff3',
          300: '#c2a8ea',
          400: '#a37add',
          500: '#8651ce',
          600: '#703aba',
          700: '#5e2e9e',
          800: '#4E2284',
          900: '#3f1c6c',
          950: '#270e48',
        },
      },
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '500', // Cap at 500
        bold: '500',     // Cap at 500
        extrabold: '500',// Cap at 500
        black: '500',    // Cap at 500
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '6px',      // Cap at 6px
        xl: '6px',      // Cap at 6px
        '2xl': '6px',   // Cap at 6px
        '3xl': '6px',   // Cap at 6px
        full: '6px',    // Cap at 6px
      },
    },
  },
  plugins: [],
}
