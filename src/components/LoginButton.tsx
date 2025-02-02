import React from "react";
import { signInWithGoogle } from "../firebase/auth"; 

export const LoginButton: React.FC = () => {
  return (
    <button 
      className="google-btn border-black-300" 
      onClick={signInWithGoogle}
    >
      Sign in with Google
    </button>
  );
};