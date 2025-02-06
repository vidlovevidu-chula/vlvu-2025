import React from "react";
import { signInWithGoogle } from "../firebase/auth";

export default function LoginButton() {
  return (
    <button className="google-btn border-black-300" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
