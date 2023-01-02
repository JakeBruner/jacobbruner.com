const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts,md}"],
  // blog tailwind classes \/ \/
  safelist: ["max-w-2xl"],
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
          DEFAULT: "#d772a1",
          600: "#c16690",
          700: "#964f70",
          800: "#6b3950",
          900: "#562d40"
        },
        zinc: {
          950: "#100E12",
          850: "#1e1e21",
          750: "#333338",
          650: "#494951"
        }
      },
      fontFamily: {
        sans: ["InterVariable", "Roboto", ...defaultTheme.fontFamily.sans],
        serif: ["Georgia", ...defaultTheme.fontFamily.serif],
        roboto: ["Roboto", ...defaultTheme.fontFamily.sans],
        mono: ["Courier", "Vazirmatn", ...defaultTheme.fontFamily.mono]
      },
      aspectRatio: {
        auto: "auto",
        square: "1 / 1",
        video: "16 / 9",
        22: "22",
        17: "17",
        8.5: "8.5"
      },
      backgroundSize: {
        'size-200': '200% 100%',
      },
      backgroundPosition: {
          'pos-0': '0% 0%',
          'pos-x-100': '100% 0%',
      },
    }
  },
  corePlugins: {
    aspectRatio: false
  },
  plugins: [require("@tailwindcss/aspect-ratio"), require("@tailwindcss/typography")]
};
