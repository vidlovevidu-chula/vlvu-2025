import React, { useEffect, useState } from "react";
import * as htmlToImage from "html-to-image";
import { validateSession } from "@/firebase/auth";
interface TicketStampProps {
  uID: string | undefined;
}
const TicketsStamp = ({ uID }: TicketStampProps) => {
  const [edgeType, setEdgeType] = useState();
  const [edgeColor, setEdgeColor] = useState();
  const [heartColor, setHeartColor] = useState();
  const [style, setStyle] = useState();
  const [wing, setWing] = useState();
  const [prop, setProp] = useState();
  const [name, setName] = useState();

  useEffect(() => {
    validateSession();
    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/tickets?uID=${uID}`);
        const data = await res.json();

        if (data.ticketName && data.decoration) {
          const decoration = data.decoration;
          setEdgeColor(decoration.edgeColor);
          setEdgeType(decoration.edgeType);
          setHeartColor(decoration.heartColor);
          setStyle(decoration.style);
          setWing(decoration.wing);
          setProp(decoration.prop);
          setName(data.ticketName);
        } else {
          console.error("No ticket data found", uID);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchTickets();
  }, [uID]);

  const downloadIMG = () => {
    const node = document.getElementById("Ticket");

    if (!node) {
      console.error("Element with ID 'Ticket' not found.");
      return;
    }
    const filter = (node: HTMLElement) => {
      const exclusionClasses = ["button"];
      return !exclusionClasses.some((classname) =>
        node.classList?.contains(classname),
      );
    };

    htmlToImage
      .toPng(node, { backgroundColor: "white", filter: filter })
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
      id="Ticket"
      className="relative flex flex-col items-center justify-center gap-4 min-h-screen py-[70px] bg-cover bg-center bg-no-repeat overflow-y-scroll overflow-x-hidden"
      style={{
        backgroundImage: "url('/assets/background.webp')",
      }}
    >
      {/* ---- Ticket Card ---- */}
      <div className="relative flex w-[240px] h-[427px] justify-center items-center bg-transparent">
        {edgeType && edgeColor && (
          <img
            src={`/images/ticket/edge/${edgeType}/${edgeColor}.webp`}
            width={240}
          />
        )}

        {heartColor && (
          <img
            src={`/images/ticket/heart/${edgeType}/${heartColor}.webp`}
            width={240}
            className="absolute"
          />
        )}

        {wing && (
          <img
            src={`/images/ticket/wing/${wing}.webp`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        <img
          src={"/images/ticket/cupid/cupid.webp"}
          width={170}
          className="absolute top-[100px]"
        />

        {style && (
          <img
            src={`/images/ticket/style/${style}.webp`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        {prop && (
          <img
            src={`/images/ticket/prop/${prop}.webp`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        {name && (
          <p className="absolute bottom-[138px] font-Yeseva text-xs font-bold text-[#863752]">
            {name}
          </p>
        )}
      </div>

      {/* ---- Navigation ---- */}
      <div className="button flex flex-col gap-4">
        <div className="bottom-8 flex gap-4">
          <button
            className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            onClick={() =>
              (window.location.href = `/ticket-stamp/ticket/${uID}`)
            }
          >
            ตกแต่ง ticket
          </button>
          <button className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
          onClick={() =>
            (window.location.href = `/ticket-stamp/stamp/${uID}`)
          }>
            ดูแสตมป์
          </button>
        </div>

        {/* ---- DownloadIMG ---- */}
        <div
          className="bg-white w-full py-[10px] filter bg-blur-sm bg-opacity-[75%] rounded-[7px] text-[13px] text-center cursor-pointer hover:bg-slate-100 hover:bg-opacity-[75%]"
          onClick={downloadIMG}
        >
          Download Your Ticket
        </div>
      </div>
    </div>
  );
};

export default TicketsStamp;
