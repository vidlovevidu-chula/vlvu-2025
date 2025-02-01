import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { a as app } from '../../chunks/server_1hFA-0b5.mjs';
export { renderers } from '../../renderers.mjs';

const db = getFirestore(app);
const STAMPS = [
  "boot1",
  "boot2",
  "boot3",
  "boot4",
  "boot5",
  "boot6",
  "boot7",
  "boot8"
];
const VALIDATE_STAMP = "validateStamp";
const post = async ({ request }) => {
  try {
    const { uID, boothId } = await request.json();
    if (![...STAMPS, VALIDATE_STAMP].includes(boothId)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid stamp name!" }),
        { status: 400 }
      );
    }
    const userRef = db.collection("StampsCollection").doc(uID);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ stamps: [] });
    }
    const currentStamps = userDoc.data()?.stamps || [];
    if (currentStamps.includes(boothId)) {
      return new Response(
        JSON.stringify({ success: false, message: "Already stamped!" }),
        { status: 400 }
      );
    }
    if (boothId === VALIDATE_STAMP) {
      const missingStamps = STAMPS.filter(
        (stamp) => !currentStamps.includes(stamp)
      );
      if (missingStamps.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Cannot collect validateStamp until all other stamps are collected!",
            missingStamps
          }),
          { status: 400 }
        );
      }
    }
    await userRef.update({
      stamps: FieldValue.arrayUnion(boothId)
    });
    return new Response(
      JSON.stringify({ success: true, message: "Stamp recorded!" })
    );
  } catch (error) {
    console.error("Error processing stamp:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error processing stamp" }),
      { status: 500 }
    );
  }
};
const get = async ({ request }) => {
  try {
    const { uID } = await request.json();
    const userRef = db.collection("StampsCollection").doc(uID);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "No stamps found!" }),
        { status: 404 }
      );
    }
    const stamps = userDoc.data()?.stamps || [];
    return new Response(JSON.stringify({ success: true, stamps }));
  } catch (error) {
    console.error("Error fetching stamps:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching stamps" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get,
  post
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
