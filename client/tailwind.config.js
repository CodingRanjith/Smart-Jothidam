/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7B3F00',   // Temple brown
        secondary: '#F4EBD0', // Palm leaf color
        accent: '#C9A227',    // Gold
      },
      fontFamily: {
        heading: ['serif'],
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
