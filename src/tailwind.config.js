/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#176e57',
          dark: '#125744',
          light: '#228b6f',
        },
      },
    },
  },
  plugins: [],
}