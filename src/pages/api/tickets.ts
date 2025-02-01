import type { APIRoute } from "astro";
import { getFirestore } from "firebase-admin/firestore";
import { app } from "../../firebase/server.ts";

const db = getFirestore(app);

// Fetch tickets 
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const doc = await db.collection("TicketsCollection").doc(id).get();
      if (!doc.exists) {
        return new Response(JSON.stringify({ success: false, message: "Ticket not found" }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true, ticket: { id: doc.id, ...doc.data() } }));
    } else {
      const snapshot = await db.collection("TicketsCollection").get();
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return new Response(JSON.stringify({ success: true, tickets }));
    }
  } catch (error) {
    console.error("Error fetching ticket(s):", error);
    return new Response(JSON.stringify({ success: false, message: "Error fetching tickets" }), { status: 500 });
  }
};

// Save a new ticket
export const POST: APIRoute = async ({ request }) => {
  try {
    const ticketData = await request.json();
    const docRef = await db.collection("TicketsCollection").add(ticketData);
    return new Response(JSON.stringify({ id: docRef.id, ...ticketData }), { status: 201 });
  } catch (error) {
    console.error("Error saving ticket:", error);
    return new Response(JSON.stringify({ success: false, message: "Error saving ticket" }), { status: 500 });
  }
};

// Delete a specific ticket by ID
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: "Ticket ID is required" }), { status: 400 });
    }

    await db.collection("TicketsCollection").doc(id).delete();
    return new Response(JSON.stringify({ success: true, message: "Ticket deleted successfully" }));
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return new Response(JSON.stringify({ success: false, message: "Error deleting ticket" }), { status: 500 });
  }
};
