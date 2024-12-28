/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
    content: ["./src/**/*.{html,ts}"],
    daisyui: {
        themes: ["light", "dark", "cupcake", "nord", "corporate"],
    },
    theme: {
        extend: {
            keyframes: {
                flyIn: {
                    "0%": { transform: "translateY(50%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            animation: {
                flyIn: "flyIn 0.5s ease-out",
            },
        },
    },
    plugins: [require("daisyui")],
};
