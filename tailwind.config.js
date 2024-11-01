/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./src/**/*.{html,ts}",],
  daisyui: {
    themes: ["light", "dark", "cupcake", "nord"],
  },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

