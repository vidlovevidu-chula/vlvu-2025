import { a as app } from "../../chunks/server_1hFA-0b5.mjs";
import { getFirestore } from "firebase-admin/firestore";
export { renderers } from "../../renderers.mjs";

const db = getFirestore(app);
const example = db.collection("wai");
const GET = async () => {
  const snapshot = await example.get();
  const data = snapshot.docs.map((doc) => doc.data());
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
};

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      GET,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);

const page = () => _page;

export { page };
