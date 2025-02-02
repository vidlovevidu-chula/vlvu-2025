import type { APIRoute } from "astro";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { app } from "../../firebase/server";

const db = getFirestore(app);

export const prerender = false; // Ensures the endpoint is server-rendered

// Fetch tickets for a specific user
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
        { status: 400 },
      );
    }

    const userTicketsRef = db.collection("TicketsCollection").doc(uID);
    const userTicketsDoc = await userTicketsRef.get();

    if (!userTicketsDoc.exists) {
      return new Response(JSON.stringify({ success: true, tickets: [] }), {
        status: 200,
      });
    }

    const tickets = userTicketsDoc.data()?.tickets || [];

    return new Response(JSON.stringify({ success: true, tickets }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching tickets" }),
      { status: 500 },
    );
  }
};

// Save a new ticket under the user's uID
export const POST: APIRoute = async ({ request }) => {
  try {
    if (!request.body) {
      return new Response(
        JSON.stringify({ success: false, message: "Request body is empty" }),
        { status: 400 },
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
        { status: 400 },
      );
    }

    if (!ticketData.uID || typeof ticketData.uID !== "string") {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or missing uID" }),
        { status: 400 },
      );
    }

    if (
      !ticketData.decoration ||
      typeof ticketData.decoration !== "object" ||
      !ticketData.decoration.background ||
      !ticketData.decoration.edge ||
      !ticketData.decoration.prop ||
      !ticketData.decoration.style ||
      !ticketData.decoration.wing
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or missing decoration fields",
        }),
        { status: 400 },
      );
    }

    const userTicketsRef = db
      .collection("TicketsCollection")
      .doc(ticketData.uID);

    // Add ticket to user's tickets array
    await userTicketsRef.set(
      { tickets: FieldValue.arrayUnion(ticketData) },
      { merge: true },
    );

    return new Response(
      JSON.stringify({ success: true, message: "Ticket added successfully" }),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error saving ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error saving ticket" }),
      { status: 500 },
    );
  }
};

// Delete a specific ticket by matching ticketName
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const uID = url.searchParams.get("uID");
    const ticketName = url.searchParams.get("ticketName");

    if (!uID || !ticketName) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "uID and ticketName are required",
        }),
        { status: 400 },
      );
    }

    const userTicketsRef = db.collection("TicketsCollection").doc(uID);
    const userTicketsDoc = await userTicketsRef.get();

    if (!userTicketsDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, message: "User has no tickets" }),
        { status: 404 },
      );
    }

    const currentTickets = userTicketsDoc.data()?.tickets || [];
    const updatedTickets = currentTickets.filter(
      (ticket) => ticket.ticketName !== ticketName,
    );

    await userTicketsRef.update({ tickets: updatedTickets });

    return new Response(
      JSON.stringify({ success: true, message: "Ticket deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error deleting ticket" }),
      { status: 500 },
    );
  }
};
