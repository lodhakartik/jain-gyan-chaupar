/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f7ecd2",
        ink: "#3a2410",
        saffron: "#e89c2a",
        crimson: "#a8261c",
        moss: "#2f6a3a",
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
      },
    },
  },
  plugins: [],
};
