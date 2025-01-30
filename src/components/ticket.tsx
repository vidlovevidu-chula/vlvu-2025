import React, { useState, useRef } from "react";
import { useStore } from "@nanostores/react";
import { page, edgeType, edgeColor, style, wing, prop } from "../store";
import Ticketlist from "./ticketList";
const Ticket = () => {
  const $pageName = useStore(page);
  const $edgeType = useStore(edgeType);
  const $edgeColor = useStore(edgeColor);
  const $style = useStore(style);
  const $wing = useStore(wing);
  const $prop = useStore(prop);

  const [display, setDisplay] = useState("Ticket");

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const ticketcolors = [
    { name: "brown", hex: "#4D3525" },
    { name: "green", hex: "#BDD340" },
    { name: "red", hex: "#F9746C" },
    { name: "orange", hex: "#FFA961" },
    { name: "yellow", hex: "#FEC775" },
    { name: "blue", hex: "#78DCF9" },
    { name: "pink", hex: "#FF8DB9" },
    { name: "purple", hex: "#C5A2FB" },
  ];
  return (
    <div
      className="flex flex-col justify-between items-center w-full h-full relative py-10"
      style={{
        backgroundImage: "url('/src/assets/background.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <p className="text-[25px] text-[#925A48] font-Yeseva font-normal">
        My God Love
      </p>

      {/* ---- Select Custom Page ---- */}
      <button
        className={`absolute top-12 h-[38px] w-[97.52px] bg-[#FFCFCF] rounded-r-full ${display === "Ticket" ? "-left-5 shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : " -left-10 drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
        onClick={() => {
          setDisplay("Ticket");
          page.set("Edge");
        }}
      >
        <img
          src={"src/assets/cupid/ticket.png"}
          width={30}
          className="absolute right-5 top-1"
        />
      </button>

      <button
        className={`absolute top-24 h-[38px] w-[97.52px] bg-[#FFCFCF] rounded-r-full ${display === "Dress" ? "-left-5 shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] " : " -left-10 drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
        onClick={() => {
          setDisplay("Dress");
          page.set("Style");
        }}
      >
        <img
          src={"src/assets/cupid/cupidmini.png"}
          width={29}
          className="absolute right-5 top-1"
        />
      </button>

      {/* ---- Select Ticket Color ---- */}
      {display === "Ticket" && $pageName === "Edge" ? (
        <div className="absolute top-24 -right-9 flex flex-col gap-2">
          {ticketcolors.map((ticketcolors) => (
            <button
              key={ticketcolors.name}
              className={`h-[38px] w-[97.52px] rounded-l-full bg-[${ticketcolors.hex}]`}
              onClick={() => edgeColor.set(`${ticketcolors.name}.png`)}
            ></button>
          ))}
        </div>
      ) : undefined}

      {/* ---- Display ---- */}
      <div className="relative flex w-[200px] h-[355.56px] justify-center items-center">
        <img
          src={`src/assets/edge/${$edgeType}/${$edgeColor}`}
          width={200}
          className="absolute"
        />
        {$wing ? (
          <img
            src={`src/assets/wing/${$wing}`}
            width={180}
            className="absolute top-12"
          />
        ) : undefined}
        <img
          src={"src/assets/cupid/cupid.png"}
          width={180}
          className="absolute top-12"
        />
        {$style ? (
          <img
            src={`src/assets/style/${$style}`}
            width={180}
            className="absolute top-12"
          />
        ) : undefined}
        {$prop ? (
          <img
            src={`src/assets/prop/${$prop}`}
            width={180}
            className="absolute top-12"
          />
        ) : undefined}
      </div>

      {/* ---- Tickets Carousel ---- */}
      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center">
          <button
            className="h-[152.72px] w-[15px] bg-[#9E9E9E] rounded-full"
            onClick={scrollPrev}
            aria-label="Scroll to previous"
          >
            <img src={"src/assets/arrow/chevrons-left.svg"} width={29} />
          </button>

          <div
            ref={containerRef}
            className="flex w-[297.25px] h-[125.12px] items-center justify-center bg-[#D9D9D9] bg-opacity-[50%] overflow-x-auto overflow-y-hidden filter drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
          >
            <Ticketlist />
          </div>

          <button
            className="h-[152.72px] w-[15px] bg-[#9E9E9E] rounded-full"
            onClick={scrollNext}
            aria-label="Scroll to next"
          >
            <img src={"src/assets/arrow/chevrons-right.svg"} width={29} />
          </button>
        </div>

        {/* ---- Ticket button ---- */}
        {display == "Ticket" ? (
          <div className="flex gap-2 mt-4">
            <button
              className={`h-[48.42px] w-[97.52px] text-[15px] font-Yeseva rounded-l-full
              ${$pageName === "Edge" ? "bg-[#E5AB6C] text-white" : "bg-[#FBF0A9] text-[#925A48]"}`}
              style={
                $pageName === "Edge"
                  ? { boxShadow: "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }
                  : undefined
              }
              onClick={() => page.set("Edge")}
            >
              <p>Edge</p>
            </button>

            <button
              className={`h-[48.42px] w-[97.52px] text-[15px] leading-4 font-Yeseva rounded-r-full
              ${$pageName === "Background" ? "bg-[#E5AB6C] text-white" : "bg-[#FBF0A9] text-[#925A48]"}`}
              style={
                $pageName === "Background"
                  ? { boxShadow: "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }
                  : undefined
              }
              onClick={() => page.set("Background")}
            >
              <p>Heart</p>
            </button>
            <button
              className="flex h-[48.42px] w-[75.95px] items-center justify-center text-[#1976D2] text-[15px] font-Yeseva bg-[#BAEAFE] rounded-full"
              onClick={() => {
                setDisplay("Dress");
                page.set("Style");
              }}
            >
              <img src="src/assets/cupid/arrow-r-blue.svg" alt="arrow-right" />
            </button>
          </div>
        ) : undefined}

        {/* ---- Dress button ---- */}
        {display == "Dress" ? (
          <div className="flex gap-2 mt-4">
            <button
              className="flex h-[48px] w-[48px] items-center justify-center text-[15px] font-Yeseva bg-[#BAEAFE] rounded-full"
              onClick={() => {
                setDisplay("Ticket");
                page.set("Edge");
              }}
            >
              <img src="src/assets/cupid/arrow-left.svg" alt="arrow-left" />
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva rounded-l-full ${$pageName === "Style" ? "bg-[#E5AB6C] text-white" : "bg-[#FBF0A9] text-[#925A48]"}`}
              style={
                $pageName === "Style"
                  ? { boxShadow: "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }
                  : undefined
              }
              onClick={() => page.set("Style")}
            >
              <p>Style</p>
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva ${$pageName === "Wing" ? "bg-[#E5AB6C] text-white" : "bg-[#FBF0A9] text-[#925A48]"}`}
              style={
                $pageName === "Wing"
                  ? { boxShadow: "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }
                  : undefined
              }
              onClick={() => page.set("Wing")}
            >
              <p>Wing</p>
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva rounded-r-full ${$pageName === "Prop" ? "bg-[#E5AB6C] text-white" : "bg-[#FBF0A9] text-[#925A48]"}`}
              style={
                $pageName === "Prop"
                  ? { boxShadow: "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }
                  : undefined
              }
              onClick={() => page.set("Prop")}
            >
              <p>Prop</p>
            </button>

            <button className="flex h-[48px] w-[48px] items-center justify-center text-[15px] font-Yeseva bg-[#FFD199] rounded-full">
              <img
                src="src/assets/cupid/arrow-r-orange.svg"
                alt="arrow-right"
              />
            </button>
          </div>
        ) : undefined}
      </div>
    </div>
  );
};

export default Ticket;
