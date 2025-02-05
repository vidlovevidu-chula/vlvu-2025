import React from "react";
import Ticketcustom from "../ticketcustom";
const Hearts = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/heart/blue.png" alt="blue.png" type="heart" />
      <Ticketcustom src="/heart/green.png" alt="green.png" type="heart" />
      <Ticketcustom src="/heart/orange.png" alt="orange.png" type="heart" />
      <Ticketcustom src="heart/pink.png" alt="pink.png" type="heart" />
      <Ticketcustom src="/heart/purple.png" alt="purple.png" type="heart" />
      <Ticketcustom src="/heart/red.png" alt="red.png" type="heart" />
      <Ticketcustom src="/heart/yellow.png" alt="yellow.png" type="heart" />
    </div>
  );
};

export default Hearts;
