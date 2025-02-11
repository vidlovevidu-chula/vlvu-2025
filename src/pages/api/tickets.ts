import type { APIRoute } from "astro";
import { getFirestore } from "firebase-admin/firestore";
import { app } from "../../firebase/server";

const db = getFirestore(app);

export const prerender = false; // Ensures the endpoint is server-rendered

// Fetch ticket for a specific user
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const uID = url.searchParams.get("uID");

    if (!uID) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User ID (uID) is required",
        }),
        { status: 400 }
      );
    }

    const userTicketRef = db.collection("TicketsCollection").doc(uID);
    const userTicketDoc = await userTicketRef.get();

    if (!userTicketDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "User does not have a ticket" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({...userTicketDoc.data() }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching ticket" }),
      { status: 500 }
    );
  }
};

// Save a new ticket under the user's uID 
export const POST: APIRoute = async ({ request }) => {
  try {
    if (!request.body) {
      return new Response(
        JSON.stringify({ success: false, message: "Request body is empty" }),
        { status: 400 }
      );
    }

    const ticketData = await request.json();

    // Validate required fields
    if (!ticketData.ticketName || typeof ticketData.ticketName !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or missing ticketName",
        }),
        { status: 400 }
      );
    }

    if (!ticketData.decoration || typeof ticketData.decoration !== "object") {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or missing decoration" }),
        { status: 400 }
      );
    }

    const newTicketRef = db.collection("TicketsCollection").doc();
    const generatedUID = newTicketRef.id; 
    
    await newTicketRef.set({
      ticketName: ticketData.ticketName,
      decoration: ticketData.decoration,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Ticket added successfully",
        uID: generatedUID, // Return the generated uID
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error saving ticket" }),
      { status: 500 }
    );
  }
};


// Update an existing ticket
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const uID = url.searchParams.get("uID");

    if (!uID) {
      return new Response(
        JSON.stringify({ success: false, message: "uID is required in query parameters" }),
        { status: 400 }
      );
    }

    if (!request.body) {
      return new Response(
        JSON.stringify({ success: false, message: "Request body is empty" }),
        { status: 400 }
      );
    }

    const updateData = await request.json();

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No fields provided to update" }),
        { status: 400 }
      );
    }

    const userTicketRef = db.collection("TicketsCollection").doc(uID);
    const userTicketDoc = await userTicketRef.get();

    if (!userTicketDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "User does not have a ticket" }),
        { status: 404 }
      );
    }

    const existingData = userTicketDoc.data();

    // Merge nested fields properly
    const mergedData = {
      ...existingData, 
      ...updateData, 
      decoration: {
        ...existingData?.decoration, 
        ...updateData?.decoration, 
      },
    };

    // Update Firestore with the merged data
    await userTicketRef.set(mergedData, { merge: true });

    return new Response(
      JSON.stringify({ success: true, message: "Ticket updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error updating ticket" }),
      { status: 500 }
    );
  }
};

// Delete a user's ticket
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const uID = url.searchParams.get("uID");

    if (!uID) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "uID is required",
        }),
        { status: 400 }
      );
    }

    const userTicketRef = db.collection("TicketsCollection").doc(uID);
    const userTicketDoc = await userTicketRef.get();

    if (!userTicketDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "User has no ticket" }),
        { status: 404 }
      );
    }

    await userTicketRef.delete();

    return new Response(
      JSON.stringify({ success: true, message: "Ticket deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error deleting ticket" }),
      { status: 500 }
    );
  }
};
