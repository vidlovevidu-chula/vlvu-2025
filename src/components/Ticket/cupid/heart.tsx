import React from "react";
import Ticketcustom from "../ticketcustom";
const Hearts = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/heart/blue.png" alt="blue" type="heart" />
      <Ticketcustom src="/heart/green.png" alt="green" type="heart" />
      <Ticketcustom src="/heart/orange.png" alt="orange" type="heart" />
      <Ticketcustom src="/heart/pink.png" alt="pink" type="heart" />
      <Ticketcustom src="/heart/purple.png" alt="purple" type="heart" />
      <Ticketcustom src="/heart/red.png" alt="red" type="heart" />
      <Ticketcustom src="/heart/yellow.png" alt="yellow" type="heart" />
    </div>
  );
};

export default Hearts;
