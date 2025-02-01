import { c as createComponent, r as renderTemplate, a as renderHead, b as renderSlot, d as createAstro } from './astro/server_T2yNNXBH.mjs';
import 'clsx';
/* empty css                        */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator" content="Astro"><meta name="viewport" content="width = device-width, initial-scale = 1.0"><title>Astro Basics</title>${renderHead()}</head> <body data-astro-cid-sckkx6r4> <main class="mobile" data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/user/Desktop/work/VLVU2025/src/layouts/Layout.astro", undefined);

export { $$Layout as $ };
