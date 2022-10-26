const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  purge: ['./src/**/*.svelte'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fbf0f5",
          100: "#f3d4e2",
          200: "#ebb8d0",
          300: "#e39cbd",
          400: "#db80aa",
          500: "#d772a1",
          600: "#c16690",
          700: "#964f70",
          800: "#6b3950",
          900: "#562d40"
        },
        // this doesn't work I dont think
        primary: "#d772a1",
        primary_translucent: "rgba(215, 114, 161, 0.8)",
        white_translucent: "rgba(255, 255, 255, 0.8)"
      },
      fontFamily: {
        sans: ["Helvetica", ...defaultTheme.fontFamily.sans],
        serif: ["sprat", ...defaultTheme.fontFamily.serif],
        mono: ["Courier", "Vazirmatn", ...defaultTheme.fontFamily.mono]
      },
      aspectRatio: {
        auto: "auto",
        square: "1 / 1",
        video: "16 / 9",
        22: "22",
        17: "17",
        8.5: "8.5"
      }
    }
  },
  corePlugins: {
    aspectRatio: false
  },
  plugins: [require("@tailwindcss/aspect-ratio"), require("@tailwindcss/typography")]
};
