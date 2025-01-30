import React from "react";
import Ticketcustom from "../ticketcustom";
const Hearts = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom
        src="src/assets/heart/blue.png"
        alt="blue.png"
        type="heart"
      />
      <Ticketcustom
        src="src/assets/heart/green.png"
        alt="green.png"
        type="heart"
      />
      <Ticketcustom
        src="src/assets/heart/orange.png"
        alt="orange.png"
        type="heart"
      />
      <Ticketcustom
        src="src/assets/heart/pink.png"
        alt="pink.png"
        type="heart"
      />
      <Ticketcustom
        src="src/assets/heart/purple.png"
        alt="purple.png"
        type="heart"
      />
      <Ticketcustom src="src/assets/heart/red.png" alt="red.png" type="heart" />
      <Ticketcustom
        src="src/assets/heart/yellow.png"
        alt="yellow.png"
        type="heart"
      />
    </div>
  );
};

export default Hearts;
