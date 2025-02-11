import React from "react";

import Ticketcustom from "../ticketcustom";
const Wings = () => {
  return (
    <div className="flex flex-row ">
      <Ticketcustom src="/wing/wing1.webp" alt="wing1" type="wing" />
      <Ticketcustom src="/wing/wing2.webp" alt="wing2" type="wing" />
      <Ticketcustom src="/wing/wing3.webp" alt="wing3" type="wing" />
      <Ticketcustom src="/wing/wing4.webp" alt="wing4" type="wing" />
      <Ticketcustom src="/wing/wing5.webp" alt="wing5" type="wing" />
    </div>
  );
};

export default Wings;
