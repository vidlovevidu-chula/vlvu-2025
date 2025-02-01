import { renderers } from "./renderers.mjs";
import { c as createExports } from "./chunks/entrypoint_z8er7aII.mjs";
import { manifest } from "./manifest_vrFpoVIV.mjs";

const serverIslandMap = new Map();

const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/api/example.astro.mjs");
const _page2 = () => import("./pages/api/stamp.astro.mjs");
const _page3 = () => import("./pages/game.astro.mjs");
const _page4 = () => import("./pages/index.astro.mjs");
const pageMap = new Map([
  [
    "node_modules/.pnpm/astro@5.1.10_@types+node@22.10.7_jiti@1.21.7_rollup@4.31.0_typescript@5.7.3_yaml@2.7.0/node_modules/astro/dist/assets/endpoint/generic.js",
    _page0,
  ],
  ["src/pages/api/example/index.ts", _page1],
  ["src/pages/api/stamp.ts", _page2],
  ["src/pages/game.astro", _page3],
  ["src/pages/index.astro", _page4],
]);

const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => import("./_noop-middleware.mjs"),
});
const _args = {
  middlewareSecret: "30f3323a-65bb-4743-8691-d1eb169fdca7",
  skewProtection: false,
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
