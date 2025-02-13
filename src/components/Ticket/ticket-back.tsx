import { validateSession } from "@/firebase/auth";
import React, { useEffect, useState } from "react";

interface TicketProps {
  user_id: string | undefined;
}

const TicketBack = ({ user_id }: TicketProps) => {
  const [edgeType, setEdgeType] = useState();
  const [edgeColor, setEdgeColor] = useState();
  const [stamps, setStamps] = useState<string[]>([]);

  useEffect(() => {
    validateSession();
    if (!user_id) {
      console.error("No user_id provided");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch both ticket and stamp data in parallel
        const [ticketResponse, stampResponse] = await Promise.all([
          fetch(`/api/tickets?uID=${user_id}`),
          fetch(`/api/stamp?uID=${user_id}`),
        ]);

        const ticketData = await ticketResponse.json();
        const stampData = await stampResponse.json();

        console.log("Ticket data:", ticketData);
        console.log("Stamp data:", stampData);

        if (ticketData.ticketName && ticketData.decoration) {
          const ticket = ticketData;
          if (ticket.decoration) {
            setEdgeType(ticket.decoration.edgeType);
            setEdgeColor(ticket.decoration.edgeColor);
          }
        }

        if (stampData.success) {
          setStamps(stampData.stamps || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user_id]);

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 min-h-screen py-[70px] bg-cover bg-center bg-no-repeat overflow-y-scroll overflow-x-hidden"
      style={{
        backgroundImage: "url('/assets/background.webp')",
      }}
    >
      {/* ---- Ticket Card ---- */}
      <div className="relative flex flex-col items-center gap-4">
        {edgeType && edgeColor && (
          <img src={`/edge/${edgeType}/${edgeColor}.webp`} width={240} />
        )}
        {/* ---- stamp collector ---- */}
        {edgeType && edgeColor && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <img src={`/backedge/${edgeType}/${edgeColor}.webp`} width={240} />
            {/* Add stamp booth 1 */}
            <div className="absolute" style={{ top: "66px", left: "56px" }}>
              <img
                src="/stamp/sugar sugar train.webp"
                alt="Sugar Sugar Train Stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot1") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 2 */}
            <div className="absolute" style={{ top: "66px", left: "140px" }}>
              <img
                src="/stamp/harmony tales.webp"
                alt="harmony tales Stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot2") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 3 */}
            <div className="absolute" style={{ top: "123px", left: "56px" }}>
              <img
                src="/stamp/bouquet of scent.webp"
                alt="bouquet of scent Stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot3") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 4 */}
            <div className="absolute" style={{ top: "123px", left: "140px" }}>
              <img
                src="/stamp/lost letters of love.webp"
                alt="lost letters of love stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot4") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 5 */}
            <div className="absolute" style={{ top: "181px", left: "56px" }}>
              <img
                src="/stamp/next station love.webp"
                alt="next station love stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot5") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 6 */}
            <div className="absolute" style={{ top: "181px", left: "140px" }}>
              <img
                src="/stamp/see something I lost in the beach.webp"
                alt="see something I lost in the beach stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot6") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 7 */}
            <div className="absolute" style={{ top: "238px", left: "56px" }}>
              <img
                src="/stamp/one shot.webp"
                alt="one shot stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot7") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp booth 8 */}
            <div className="absolute" style={{ top: "238px", left: "140px" }}>
              <img
                src="/stamp/you and me and me.webp"
                alt="you and me and me stamp"
                className={`w-11 h-11 object-contain ${stamps.includes("boot8") ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp secret5 */}
            <div className="absolute" style={{ top: "297px", left: "60px" }}>
              <img
                src="/stamp/secret 5.webp"
                alt="secret 5 stamp"
                className={`w-[126px] h-28 object-contain ${stamps.length >= 5 && stamps.length < 8 ? "" : "hidden"}`}
              />
            </div>
            {/* Add stamp secret8 */}
            <div className="absolute" style={{ top: `${edgeType === "edge2" ? '323px' : (edgeType === "edge4" ? '321px' : '323px')}`, left: "55px" }}>
              <img
                src="/stamp/secret 8.webp"
                alt="secret 8 stamp"
                className={`w-[128px] h-[${edgeType === "edge2" ? '320px' : '75px'}] object-fill ${stamps.length == 8 ? "" : "hidden"}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---- Navigation ---- */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="bottom-8 flex flex-col items-center gap-2">
          <button
            className="text-[#000000] bg-[#FFF2E0] w-[200px] rounded-[10px] h-[51px] font-Yeseva shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            onClick={() =>
              (window.location.href = `/ticket-stamp/scan/${user_id}`)
            }
          >
            Scan QR Code
          </button>
          <a
            href={`/ticket-stamp/${user_id}`}
            className="text-black text-sm font-NotoSansThai underline mt-2 text-shadow-sm"
          >
            ← Go back to ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default TicketBack;
