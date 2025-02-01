import { c as createComponent, r as renderTemplate, m as maybeRenderHead, e as renderComponent, d as createAstro } from '../chunks/astro/server_T2yNNXBH.mjs';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { $ as $$Layout } from '../chunks/Layout_B0sHHZdV.mjs';
export { renderers } from '../renderers.mjs';

const Example = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "font-Atasanee", children: "Example" }),
    /* @__PURE__ */ jsx("p", { className: "font-Ribbon", children: "This is an example component. It is rendered on the client side." }),
    /* @__PURE__ */ jsx("p", { className: "font-Yeseva", children: "This is an example component. It is rendered on the client side." })
  ] }) });
};

const $$Astro$1 = createAstro();
const $$Welcome = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Welcome;
  const wai = await fetch("http://localhost:4321/api/example");
  const json = await wai.json();
  console.info(json);
  return renderTemplate`${maybeRenderHead()}<div class="text-6xl"> <h1>Welcome to Astro</h1> <p>Build faster websites with less client-side Javascript</p> ${renderComponent($$result, "Example", Example, {})} </div>`;
}, "/Users/user/Desktop/work/VLVU2025/src/components/Welcome.astro", undefined);

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Welcome", $$Welcome, {})} ` })}`;
}, "/Users/user/Desktop/work/VLVU2025/src/pages/index.astro", undefined);

const $$file = "/Users/user/Desktop/work/VLVU2025/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
