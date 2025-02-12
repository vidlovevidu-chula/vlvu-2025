import React from "react";
import Ticketcustom from "../ticketcustom";
import { useStore } from "@nanostores/react";
import { edgeColor } from "../../../store";
const Edges = () => {
  const $edgeColor = useStore(edgeColor);

  return (
    <div className="flex flex-row">
      <Ticketcustom
        src={`/edge/edge1/${$edgeColor}.png`}
        alt="edge1"
        type="edge"
      />
      <Ticketcustom
        src={`/edge/edge2/${$edgeColor}.png`}
        alt="edge2"
        type="edge"
      />
      <Ticketcustom
        src={`/edge/edge3/${$edgeColor}.png`}
        alt="edge3"
        type="edge"
      />
      <Ticketcustom
        src={`/edge/edge4/${$edgeColor}.png`}
        alt="edge4"
        type="edge"
      />
    </div>
  );
};

export default Edges;
