import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./client";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken ?? null;
    const user = result.user;

    console.log("User:", user);
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
