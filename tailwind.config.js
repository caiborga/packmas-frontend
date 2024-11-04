/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./src/**/*.{html,ts}",],
  daisyui: {
    themes: ["light", "dark", "cupcake", "nord", "corporate"],
  },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

