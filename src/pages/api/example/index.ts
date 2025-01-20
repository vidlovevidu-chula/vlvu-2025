import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore(app);
const example = db.collection("wai");

export const GET: APIRoute = async () => {
  const snapshot = await example.get();
  const data = snapshot.docs.map((doc) => doc.data());
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
};
