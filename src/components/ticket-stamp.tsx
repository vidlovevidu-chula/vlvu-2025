import React from "react";
import {
  edgeColor,
  edgeType,
  heartColor,
  prop,
  style,
  wing,
  name,
} from "@/store";
import { useStore } from "@nanostores/react";
import * as htmlToImage from 'html-to-image';

const TicketsStamp = () => {
  const $edgeType = useStore(edgeType);
  const $edgeColor = useStore(edgeColor);
  const $heartColor = useStore(heartColor);
  const $style = useStore(style);
  const $wing = useStore(wing);
  const $prop = useStore(prop);
  const $name = useStore(name);
  
  const downloadIMG = () => {
    const node = document.getElementById("Ticket");

    if (!node) {
      console.error("Element with ID 'Ticket' not found.");
      return;
    }

    htmlToImage
      .toPng(node)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "ticket.png";
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong!", error);
      });
  };
    
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 min-h-screen py-[70px]"
      style={{
        backgroundImage: "url('/src/assets/background.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      {/* Ticket Card */}
      <div id='Ticket' className="relative flex w-fit h-fit justify-center items-center bg-transparent">
        <img src={`src/assets/edge/${$edgeType}/${$edgeColor}`} width={240} />
        {$heartColor && (
          <img
            src={`src/assets/heart/${$edgeType}/${$heartColor}`}
            width={240}
            className="absolute"
          />
        )}
        <img
          src={`src/assets/wing/${$wing}`}
          width={170}
          className="absolute top-[100px]"
        />
        <img
          src={"src/assets/cupid/cupid.png"}
          width={170}
          className="absolute top-[100px]"
        />
        <img
          src={`src/assets/style/${$style}`}
          width={170}
          className="absolute top-[100px]"
        />

        <img
          src={`src/assets/prop/${$prop}`}
          width={170}
          className="absolute top-[100px]"
        />
        <p
          className={`absolute bottom-[140px] font-Inter text-xs font-bold text-[#863752]`}
        >
          {$name}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4">
      <div className="bottom-8 flex gap-4">
        <button
          className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter"
          onClick={() => (window.location.href = "/ticket")}
        >
          ตกแต่ง ticket
        </button>
        <button className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter">
          ดูแสตมป์
        </button>
      </div>

      {/* Share */}
      <div className="bg-white w-full py-[10px] filter bg-blur-sm bg-opacity-[75%] rounded-[7px] text-[13px] text-center
      cursor-pointer"
      onClick={downloadIMG}>
        Download Your Ticket
      </div>
      </div>
    </div>
  );
};

export default TicketsStamp;
