/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{astro,js,ts,jsx,tsx,mdx,svelte,vue}",
    "./src/components/**/*.{astro,js,ts,jsx,tsx,mdx,svelte,vue}",
    "./src/app/**/*.{astro,js,ts,jsx,tsx,mdx,svelte,vue}",
  ],
  theme: {
    extend: {
      colors: {
        lightpink: "#ffcfcf",
        pink: "#fdb5bf",
        orange: "#ffd199",
        yellow: "#fbf0a9",
        lightblue: "#baeafe",
        blue: "#aadbfe",
        lightbrown: "#c68c79",
        brown: "#a77b73",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        Atasanee: ["AtasaneeDEMO", "sans-serif"],
        Ribbon: ["RibbonDemo", "serif"],
        Yeseva: ["YesevaOne", "cursive"],
      },
    },
  },
  plugins: [],
};
