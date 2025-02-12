import React, { useEffect, useState } from "react";
import { signInWithGoogle } from "../firebase/auth";

const Login = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative bg-[#FAF0E0] h-screen overflow-hidden">
      {/* sliding up */}
      <div
        className={`
        absolute top-0 left-0 right-0 bg-[#FFCFCF] h-[50%]
        transition-all duration-[2000ms] ease-in-out z-50
        ${isMounted ? "-translate-y-full" : "translate-y-0"}
      `}
      ></div>

      {/* sliding down */}
      <div
        className={`
        absolute bottom-0 left-0 right-0 bg-[#FFCFCF] h-[50%]
        transition-all duration-[2000ms] ease-in-out z-50
        ${isMounted ? "translate-y-full" : "translate-y-0"}
      `}
      ></div>

      <img
        src="/images/home/vlvu.webp"
        width={120}
        className={`absolute transform -translate-x-1/2 top-1/2 left-1/2  duration-[2000ms] ease-in-out z-50
    ${isMounted ? "-translate-y-56" : "-translate-y-1/2"}
  }`}
      />

      {/* Main content */}
      <div
        className={`relative flex flex-col items-center justify-center h-full  gap-8 duration-[3000ms] ease-in-out z-0 ${isMounted ? "opacity-100" : "opacity-0"}`}
      >
        <h1 className="text-xl font-Yeseva text-[#925A48]">Log In</h1>

        <button
          onClick={signInWithGoogle}
          className="flex bg-white px-8 py-2 rounded-lg items-center justify-center gap-3
             hover:shadow-lg transition-shadow duration-200 w-full max-w-[300px]
             border border-[#e0e0e0]"
        >
          <img src="assets/google.svg" className="w-6 h-6" alt="Google logo" />
          <span className="font-sans">Sign in with Google</span>
        </button>

        <a
          href="/"
          className="absolute bottom-8 hover:text-[#FFCFCF] transition-colors duration-200
              flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          กลับไปหน้าหลัก
        </a>
      </div>
    </div>
  );
};

export default Login;
