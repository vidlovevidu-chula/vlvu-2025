import type { APIRoute } from "astro";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { app } from "../../firebase/server.ts";

const db = getFirestore(app);

// List of valid stamps
const STAMPS = [
  "boot1",
  "boot2",
  "boot3",
  "boot4",
  "boot5",
  "boot6",
  "boot7",
  "boot8",
];
const VALIDATE_STAMP = "validateStamp";

// Add a stamp for a specific user
export const post: APIRoute = async ({ request }) => {
  try {
    const { uID, boothId } = await request.json();

    // Validate the stamp name
    if (![...STAMPS, VALIDATE_STAMP].includes(boothId)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid stamp name!" }),
        { status: 400 },
      );
    }

    // Reference to the user's document in StampsCollection
    const userRef = db.collection("StampsCollection").doc(uID);
    const userDoc = await userRef.get();

    // If the document doesn't exist, initialize it with an empty stamps array
    if (!userDoc.exists) {
      await userRef.set({ stamps: [] });
    }

    // Retrieve the current stamps
    const currentStamps = userDoc.data()?.stamps || [];

    // Check if the stamp is already collected
    if (currentStamps.includes(boothId)) {
      return new Response(
        JSON.stringify({ success: false, message: "Already stamped!" }),
        { status: 400 },
      );
    }

    // Check if the user is trying to collect `validateStamp`
    if (boothId === VALIDATE_STAMP) {
      // Ensure all `STAMPS` are collected
      const missingStamps = STAMPS.filter(
        (stamp) => !currentStamps.includes(stamp),
      );
      if (missingStamps.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Cannot collect validateStamp until all other stamps are collected!",
            missingStamps,
          }),
          { status: 400 },
        );
      }
    }

    // Add the new stamp to the stamps array
    await userRef.update({
      stamps: FieldValue.arrayUnion(boothId),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Stamp recorded!" }),
    );
  } catch (error) {
    console.error("Error processing stamp:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error processing stamp" }),
      { status: 500 },
    );
  }
};

// Get all stamps for a specific user
export const get: APIRoute = async ({ request }) => {
  try {
    const { uID } = await request.json();

    // Reference to the user's document in StampsCollection
    const userRef = db.collection("StampsCollection").doc(uID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "No stamps found!" }),
        { status: 404 },
      );
    }

    // Retrieve the stamps array
    const stamps = userDoc.data()?.stamps || [];

    return new Response(JSON.stringify({ success: true, stamps }));
  } catch (error) {
    console.error("Error fetching stamps:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching stamps" }),
      { status: 500 },
    );
  }
};
