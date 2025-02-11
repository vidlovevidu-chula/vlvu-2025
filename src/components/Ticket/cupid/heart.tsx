import React from "react";
import Ticketcustom from "../ticketcustom";
const Hearts = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/heart/blue.webp" alt="blue" type="heart" />
      <Ticketcustom src="/heart/green.webp" alt="green" type="heart" />
      <Ticketcustom src="/heart/orange.webp" alt="orange" type="heart" />
      <Ticketcustom src="/heart/pink.webp" alt="pink" type="heart" />
      <Ticketcustom src="/heart/purple.webp" alt="purple" type="heart" />
      <Ticketcustom src="/heart/red.webp" alt="red" type="heart" />
      <Ticketcustom src="/heart/yellow.webp" alt="yellow" type="heart" />
    </div>
  );
};

export default Hearts;
