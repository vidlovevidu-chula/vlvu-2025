// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import vercelServerless from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],

  output: "server",

  adapter: vercelServerless({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 30,
  }),
});
