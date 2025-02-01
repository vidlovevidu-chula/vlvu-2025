import { c as createComponent, r as renderTemplate, e as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_T2yNNXBH.mjs';
import { $ as $$Layout } from '../chunks/Layout_B0sHHZdV.mjs';
export { renderers } from '../renderers.mjs';

const $$Game = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "GAME" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>GAME</h1> <p>Let's play a game!</p> <p>Click the button below to start the game.</p> <button>Start Game</button> ` })}`;
}, "/Users/user/Desktop/work/VLVU2025/src/pages/game.astro", undefined);

const $$file = "/Users/user/Desktop/work/VLVU2025/src/pages/game.astro";
const $$url = "/game";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Game,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
