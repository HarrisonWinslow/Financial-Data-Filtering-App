/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tailwind will scan your JSX/TSX files
  ],
  theme: {
    extend: {
      colors: {
        "valueglance": "#162055",
      },
    },
  },
  plugins: [],
}


