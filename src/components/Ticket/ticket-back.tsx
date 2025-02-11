import React, { useEffect, useState } from "react";

interface TicketProps {
  user_id: string | undefined;
}

const TicketBack = ({ user_id }: TicketProps) => {
  const [edgeType, setEdgeType] = useState();
  const [edgeColor, setEdgeColor] = useState();

  useEffect(() => {
    if (!user_id) {
      console.error("No user_id provided");
      return;
    }

    const fetchTicketData = async () => {
      try {
        const response = await fetch(`/api/tickets?uID=${user_id}`);
        const data = await response.json();
        console.log("API response data:", data);

        if (data.success && data.tickets) {
          const ticket = data.tickets[0];
          if (ticket.decoration) {
            setEdgeType(ticket.decoration.edgeType);
            setEdgeColor(ticket.decoration.edgeColor);
          } else {
            console.error("No decoration data found for ticket:", ticket);
          }
        } else {
          console.error("No ticket data found for user:", user_id);
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchTicketData();
  }, [user_id]);

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 min-h-screen py-[70px] bg-cover bg-center bg-no-repeat overflow-y-scroll overflow-x-hidden"
      style={{
        backgroundImage: "url('/assets/background.png')",
      }}
    >
      {/* ---- Ticket Card ---- */}
      <div className="relative flex flex-col items-center gap-4">
        {edgeType && edgeColor && (
          <img src={`/edge/${edgeType}/${edgeColor}.png`} width={240} />
        )}
        {/* ---- stamp collector ---- */}
        {edgeType && edgeColor && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <img src={`/backedge/${edgeType}/${edgeColor}.png`} width={240} />
          </div>
        )}
      </div>

      {/* ---- Navigation ---- */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="bottom-8 flex flex-col items-center gap-2">
          <button
            className="text-[#000000] bg-[#FFF2E0] w-[200px] rounded-[10px] h-[51px] font-Inter shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            onClick={() =>
              (window.location.href = `/ticket-stamp/ticket/${user_id}`)
            }
          >
            แสกน QR Code
          </button>
          <a
            href={`/ticket-stamp/ticket/${user_id}`}
            className="text-[#000000] text-sm font-Inter underline mt-2"
          >
            กลับไปยัง ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default TicketBack;