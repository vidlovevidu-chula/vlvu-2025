import React, { useEffect, useState } from "react";
import * as htmlToImage from "html-to-image";
interface TicketStampProps {
  user_id: string | undefined;
}
const TicketsStamp = ({ user_id }: TicketStampProps) => {
  const [edgeType, setEdgeType] = useState();
  const [edgeColor, setEdgeColor] = useState();
  const [heartColor, setHeartColor] = useState();
  const [style, setStyle] = useState();
  const [wing, setWing] = useState();
  const [prop, setProp] = useState();
  const [name, setName] = useState();

  useEffect(() => {
    if (!user_id) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/tickets?uID=${user_id}`);
        const data = await res.json();

        if (data.success && data.tickets) {
          const ticket = data.tickets;
          setEdgeColor(ticket.decoration.edgeColor);
          setEdgeType(ticket.decoration.edgeType);
          setHeartColor(ticket.decoration.heartColor);
          setStyle(ticket.decoration.style);
          setWing(ticket.decoration.wing);
          setProp(ticket.decoration.prop);
          setName(ticket.ticketName);
        } else {
          console.error("No ticket data found", user_id);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchTickets();
  }, [user_id]);

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
      className="relative flex flex-col items-center justify-center gap-4 min-h-screen py-[70px] bg-cover bg-center bg-no-repeat overflow-y-scroll overflow-x-hidden"
      style={{
        backgroundImage: "url('/assets/background.png')",
      }}
    >
      {/* ---- Ticket Card ---- */}
      <div
        id="Ticket"
        className="relative flex w-[240px] h-[427px] justify-center items-center bg-transparent"
      >
        {edgeType && edgeColor && (
          <img src={`/edge/${edgeType}/${edgeColor}.png`} width={240} />
        )}

        {heartColor && (
          <img
            src={`/heart/${edgeType}/${heartColor}.png`}
            width={240}
            className="absolute"
          />
        )}

        {wing && (
          <img
            src={`/wing/${wing}.png`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        <img
          src={"/cupid/cupid.png"}
          width={170}
          className="absolute top-[100px]"
        />

        {style && (
          <img
            src={`/style/${style}.png`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        {prop && (
          <img
            src={`/prop/${prop}.png`}
            width={170}
            className="absolute top-[100px]"
          />
        )}

        {name && (
          <p className="absolute bottom-[138px] font-Inter text-xs font-bold text-[#863752]">
            {name}
          </p>
        )}
      </div>

      {/* ---- Navigation ---- */}
      <div className="flex flex-col gap-4">
        <div className="bottom-8 flex gap-4">
          <button
            className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            onClick={() =>
              (window.location.href = `/ticket-stamp/ticket/${user_id}`)
            }
          >
            ตกแต่ง ticket
          </button>
          <button className="bg-[#FFF2E0] w-[128px] rounded-[10px] h-[51px] font-Inter shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
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
