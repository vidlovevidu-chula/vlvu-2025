import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./client";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const getStoredToken = (): string | null => localStorage.getItem("accessToken");

const saveToken = (token: string) => localStorage.setItem("accessToken", token);
const postDefaultTicket = async (uID: string) => {
  const defaultTicket = {
    ticketName: "vidva & vidya",
    uID,
    decoration: {
      edgeColor: "pink",
      edgeType: "edge3",
      heartColor: "edge3",
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
    if (!response.ok) {
      throw new Error(data.message || "Failed to post ticket");
    }
    console.log("Ticket posted successfully:", data);
  } catch (error) {
    console.error("Error posting ticket:", error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const existingToken = getStoredToken();

    if (existingToken) {
      console.log("Already signed in.");
      return { user: auth.currentUser, token: existingToken };
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken ?? null;
    const user = result.user;

    if (token) saveToken(token);
    if (user) {
      await postDefaultTicket(user.uid);
    }
    console.log("User signed in:", user);
    console.log("Access Token:", token);
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
