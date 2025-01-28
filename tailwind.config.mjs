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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
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
  plugins: [import("tailwindcss-animate")],
};
