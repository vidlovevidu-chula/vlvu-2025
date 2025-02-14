import * as React from "react";

const WebTitle: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen h-full leading-tight font-Ovo">
      <img
        className="px-10 -mt-20 animate-fadeIn z-10"
        src="/images/home/title.webp"
        alt="title"
      />
      <p
        className="text-redbrown text-lg text-shadow-sm font-semibold animate-fadeIn"
        style={{
          animationDelay: "0.5s",
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        14 February 2025 | 16:30 onwards
      </p>
      <p
        className="text-redbrown text-lg text-shadow-sm font-semibold animate-fadeIn"
        style={{
          animationDelay: "1s",
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        at Larnchak - Larn Intania
      </p>
      {/* <a
        href="https://forms.gle/oB1YhtJAxJ8nmkN59"
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center justify-center mt-10 px-6 py-2 bg-redbrown text-white font-semibold text-lg rounded-full text-shadow-md shadow-lg font-Yeseva animate-fadeUp"
        style={{
          animationDelay: "1.5s",
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        PRE-REGISTER
      </a> */}
    </div>
  );
};
export default WebTitle;
