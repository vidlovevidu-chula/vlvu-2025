import React from "react";
import Ticketcustom from "../ticketcustom";
import { useStore } from "@nanostores/react";
import { edgeColor } from "../../store";
const Edges = () => {
  const $edgeColor = useStore(edgeColor);

  return (
    <div className="flex flex-row">
      <Ticketcustom
        src={`src/assets/edge/edge1/${$edgeColor}`}
        alt="edge1"
        type="edge"
      />
      <Ticketcustom
        src={`src/assets/edge/edge2/${$edgeColor}`}
        alt="edge2"
        type="edge"
      />
      <Ticketcustom
        src={`src/assets/edge/edge3/${$edgeColor}`}
        alt="edge3"
        type="edge"
      />
      <Ticketcustom
        src={`src/assets/edge/edge4/${$edgeColor}`}
        alt="edge4"
        type="edge"
      />
    </div>
  );
};

export default Edges;
