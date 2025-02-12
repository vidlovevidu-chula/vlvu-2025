import React from "react";

import Ticketcustom from "../ticketcustom";
const Wings = () => {
  return (
    <div className="flex flex-row ">
      <Ticketcustom src="/wing/wing1.png" alt="wing1" type="wing" />
      <Ticketcustom src="/wing/wing2.png" alt="wing2" type="wing" />
      <Ticketcustom src="/wing/wing3.png" alt="wing3" type="wing" />
      <Ticketcustom src="/wing/wing4.png" alt="wing4" type="wing" />
      <Ticketcustom src="/wing/wing5.png" alt="wing5" type="wing" />
    </div>
  );
};

export default Wings;
