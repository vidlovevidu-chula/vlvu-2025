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
      keyframes: {
        "zoom-in": {
          "0%": {
            opacity: 0,
            transform: "scale3d(0.3, 0.3, 0.3)",
          },
          "80%": {
            opacity: 0.8,
            transform: "scale3d(1.1, 1.1, 1.1)",
          },
          "100%": {
            opacity: 1,
          },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(1rem)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        letterFadeUp: {
          from: {
            opacity: 0,
            transform: "translate3d(50%, -150%, 0)",
            top: "50%",
            left: "50%",
          },
          to: {
            opacity: 1,
            transform: "translate3d(50%, -50%, 0)",
            top: "50%",
            left: "50%",
          },
        },
      },
      animation: {
        zoomIn: "zoom-in 1s ease-out 0s 1",
        fadeIn: "fadeIn 1s ease-in-out",
        fadeOut: "fadeOut 1s ease-in-out",
        fadeUp: "fadeUp 1s ease-in-out",
        letterFadeUp: "fadeUp 1s ease-in-out",
      },
    },
  },
  plugins: [import("tailwindcss-animate")],
};
