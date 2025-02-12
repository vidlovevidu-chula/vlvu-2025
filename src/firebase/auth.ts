import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./client";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Store token in sessionStorage (valid only for the session)
const saveToken = (token: string) => sessionStorage.setItem("accessToken", token);

// Generate a session fingerprint to track the session
const generateSessionKey = (): string => btoa(`${navigator.userAgent}-${Math.random()}`);

const postDefaultTicket = async (uID: string) => {
  const defaultTicket = {
    ticketName: "vidva & vidya",
    uID,
    decoration: {
      edgeColor: "pink",
      edgeType: "edge3",
      heartColor: "pink",
      prop: "prop3",
      style: "style4",
      wing: "wing2",
    },
  };

  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultTicket),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to post ticket");

    console.log("Ticket posted successfully:", data);
  } catch (error) {
    console.error("Error posting ticket:", error);
  }
};

const checkTicketExists = async (uID: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/tickets?uID=${uID}`);
    if (!response.ok) throw new Error("Failed to fetch ticket");
    const data = await response.json();
    return data.uID;
  } catch (error) {
    console.error("Error checking ticket:", error);
    return false;
  }
};

// Validate session before allowing ticket access
export const validateSession = () => {
  const storedSession = sessionStorage.getItem("sessionKey");
  if (!storedSession || storedSession !== sessionStorage.getItem("sessionKey")) {
    alert("Invalid session. Please sign in again.");
    auth.signOut();
    sessionStorage.clear();
    window.location.href = "/login"; // Redirect user
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken ?? null;
    const user = result.user;

    if (token) saveToken(token);

    if (user) {
      // Generate a unique session key and store it
      const sessionKey = generateSessionKey();
      sessionStorage.setItem("sessionKey", sessionKey);

      const ticketExists = await checkTicketExists(user.uid);
      if (!ticketExists) {
        await postDefaultTicket(user.uid);
      }
    }

    console.log("User signed in:", user);
    console.log("Access Token:", token);

    // Secure redirect with session validation
    window.location.href = `/ticket-stamp/${user.uid}?session=${sessionStorage.getItem("sessionKey")}`;

    return { user, token };
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      const firebaseError = error as { code: string; message: string };
      console.error("Error Code:", firebaseError.code);
      console.error("Error Message:", firebaseError.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
