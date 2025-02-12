import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  page,
  edgeType,
  edgeColor,
  heartColor,
  style,
  wing,
  prop,
  name,
} from "@/store";
import DecorationItems from "./decorationItems";

interface TicketProps {
  uID: string | undefined;
}

const Ticket = ({ uID }: TicketProps) => {
  const $pageName = useStore(page);
  const $edgeType = useStore(edgeType);
  const $edgeColor = useStore(edgeColor);
  const $heartColor = useStore(heartColor);
  const $style = useStore(style);
  const $wing = useStore(wing);
  const $prop = useStore(prop);
  const $name = useStore(name);
  const [display, setDisplay] = useState("Ticket");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/tickets?uID=${uID}`);
        const data = await res.json();

        if (data.ticketName && data.decoration) {
          const decoration = data.decoration;
          edgeColor.set(decoration.edgeColor);
          edgeType.set(decoration.edgeType);
          heartColor.set(decoration.heartColor);
          style.set(decoration.style);
          wing.set(decoration.wing);
          prop.set(decoration.prop);
          name.set(data.ticketName);
        } else {
          console.error("No ticket data found", uID);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchTickets();
  }, [uID]);

  const updateTicket = async () => {
    if (!uID) return;

    const updateData = {
      ticketName: $name,
      decoration: {
        edgeColor: $edgeColor,
        edgeType: $edgeType,
        heartColor: $heartColor,
        style: $style,
        wing: $wing,
        prop: $prop,
      },
    };

    try {
      const res = await fetch(`/api/tickets?uID=${uID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      console.log("Ticket updated successfully");
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const scroll = (direction: "prev" | "next") => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === "prev" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const edgecolors = [
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
      className="flex flex-col items-center min-h-screen relative py-[70px] bg-cover bg-center bg-no-repeat overflow-y-scroll overflow-x-hidden"
      style={{
        backgroundImage: "url('/assets/background.webp')",
      }}
    >
      {/* ---- Select Custom Page ---- */}
      {display !== "Name" && (
        <div className="absolute top-0 left-0">
          <button
            className={`absolute top-12 h-[38px] w-[97.52px] bg-[#FFCFCF] rounded-r-full ${display === "Ticket" ? "-left-5 shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : " -left-10 drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
            onClick={() => {
              setDisplay("Ticket");
              page.set("Edge");
            }}
          >
            <img
              src={"/images/ticket/cupid/ticket.webp"}
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
              src={"/images/ticket/cupid/cupidmini.webp"}
              width={29}
              className="absolute right-5 top-1"
            />
          </button>
        </div>
      )}

      {/* ---- Select Ticket Color ---- */}
      {display === "Ticket" && $pageName === "Edge" && (
        <div className="absolute top-24 -right-9 flex flex-col gap-2">
          {edgecolors.map((edgecolor) => (
            <button
              key={edgecolor.name}
              className="h-[38px] w-[97.52px] rounded-l-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
              style={{ background: edgecolor.hex }}
              onClick={() => edgeColor.set(`${edgecolor.name}`)}
            ></button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center h-fit">
        {/* ---- Title ---- */}
        <p className="text-[25px] text-[#925A48] font-Yeseva font-light">
          Oh! My Love god
        </p>

        {/* ---- Display ---- */}
        <div className="relative flex w-[240px] h-[427px] justify-center items-center">
          {$edgeType && $edgeColor && (
            <img
              src={`/images/ticket/edge/${$edgeType}/${$edgeColor}.webp`}
              width={240}
            />
          )}
          {$heartColor && (
            <img
              src={`/images/ticket/heart/${$edgeType}/${$heartColor}.webp`}
              width={240}
              className="absolute"
            />
          )}
          {$wing && (
            <img
              src={`/images/ticket/wing/${$wing}.webp`}
              width={170}
              className="absolute top-[100px]"
            />
          )}
          <img
            src={"/images/ticket/cupid/cupid.webp"}
            width={170}
            className="absolute top-[100px]"
          />
          {$style && (
            <img
              src={`/images/ticket/style/${$style}.webp`}
              width={170}
              className="absolute top-[100px]"
            />
          )}
          {$prop && (
            <img
              src={`/images/ticket/prop/${$prop}.webp`}
              width={170}
              className="absolute top-[100px]"
            />
          )}
          {$name && (
            <p className="absolute bottom-[138px] font-Yeseva text-xs font-bold text-[#863752]">
              {$name}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        {/* ---- Tickets Carousel ---- */}

        {display !== "Name" && (
          <div className="flex items-center">
            <button
              className="h-[152.72px] w-[15px] bg-[#9E9E9E] rounded-full"
              onClick={() => scroll("prev")}
              aria-label="Scroll to previous"
            >
              <img src={"/images/ticket/arrow/chevrons-left.svg"} width={29} />
            </button>

            <div
              ref={containerRef}
              className="flex w-[297.25px] h-[125.12px] items-center justify-center bg-[#D9D9D9] bg-opacity-[50%] overflow-x-auto overflow-y-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            >
              <DecorationItems />
            </div>

            <button
              className="h-[152.72px] w-[15px] bg-[#9E9E9E] rounded-full"
              onClick={() => scroll("next")}
              aria-label="Scroll to next"
            >
              <img src={"/images/ticket/arrow/chevrons-right.svg"} width={29} />
            </button>
          </div>
        )}

        {/* ---- Ticket button ---- */}
        {display == "Ticket" && (
          <div className="flex gap-2 mt-4">
            <button
              className={`h-[48.42px] w-[97.52px] text-[15px] font-Yeseva font-light rounded-l-full
              ${$pageName === "Edge" ? "bg-[#E5AB6C] text-white shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : "bg-[#FBF0A9] text-[#925A48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
              onClick={() => page.set("Edge")}
            >
              <p>edge</p>
            </button>
            <button
              className={`h-[48.42px] w-[97.52px] text-[15px] leading-4 font-Yeseva font-light rounded-r-full
              ${$pageName === "Heart" ? "bg-[#E5AB6C] text-white shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : "bg-[#FBF0A9] text-[#925A48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
              onClick={() => page.set("Heart")}
            >
              <p>heart</p>
            </button>
            <button
              className="flex h-[48.42px] w-[75.95px] items-center justify-center text-[#1976D2] text-[15px] font-Yeseva font-light bg-[#BAEAFE] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
              onClick={() => {
                setDisplay("Dress");
                page.set("Style");
              }}
            >
              <img
                src="/images/ticket/cupid/arrow-r-blue.svg"
                alt="arrow-right"
              />
            </button>
          </div>
        )}

        {/* ---- Dress button ---- */}
        {display == "Dress" && (
          <div className="flex gap-2 mt-4">
            <button
              className="flex h-[48px] w-[48px] items-center justify-center text-[15px] font-Yeseva font-light bg-[#BAEAFE] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
              onClick={() => {
                setDisplay("Ticket");
                page.set("Edge");
              }}
            >
              <img src="/images/ticket/cupid/arrow-left.svg" alt="arrow-left" />
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva font-light rounded-l-full
              ${$pageName === "Style" ? "bg-[#E5AB6C] text-white shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : "bg-[#FBF0A9] text-[#925A48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
              onClick={() => page.set("Style")}
            >
              <p>style</p>
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva font-light
              ${$pageName === "Wing" ? "bg-[#E5AB6C] text-white shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : "bg-[#FBF0A9] text-[#925A48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
              onClick={() => page.set("Wing")}
            >
              <p>wing</p>
            </button>

            <button
              className={`h-[49px] w-[67px] text-[15px] font-Yeseva font-light rounded-r-full
              ${$pageName === "Prop" ? "bg-[#E5AB6C] text-white shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]" : "bg-[#FBF0A9] text-[#925A48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"}`}
              onClick={() => page.set("Prop")}
            >
              <p>prop</p>
            </button>

            <button
              className="flex h-[48px] w-[48px] items-center justify-center text-[15px] font-Yeseva font-light bg-[#FFD199] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
              onClick={() => setDisplay("Name")}
            >
              <img
                src="/images/ticket/cupid/arrow-r-orange.svg"
                alt="arrow-right"
              />
            </button>
          </div>
        )}

        {display === "Name" && (
          <div className="flex flex-col items-center gap-2 bg-white bg-opacity-[70%] p-4 rounded-[10px]">
            <p className="font-Yeseva font-light text-[#925A48] text-center">
              Enter your name
            </p>
            <input
              placeholder="Name"
              className="rounded-[13px] h-[37px] px-4 text-center bg-white focus:outline-none"
              maxLength={13}
              value={$name}
              onChange={(e) => name.set(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="flex h-[27px] w-[75.95px] py-[20px] items-center justify-center text-[15px] font-Yeseva font-light bg-[#BAEAFE] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                onClick={() => {
                  setDisplay("Dress");
                  page.set("Style");
                }}
              >
                <img
                  src="/images/ticket/cupid/arrow-left.svg"
                  alt="arrow-left"
                />
              </button>
              <button
                className="flex h-[27px] w-[116px] py-[20px] items-center justify-center text-[15px] font-Yeseva font-light bg-[#FFE3E3] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                onClick={() => {
                  window.location.href = `/ticket-stamp/${uID}`;
                  updateTicket();
                }}
              >
                <p>เสร็จสิ้น</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticket;
