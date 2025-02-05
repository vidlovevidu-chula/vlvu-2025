import React from "react";

import Ticketcustom from "../ticketcustom";
const Wings = () => {
  return (
    <div className="flex flex-row ">
      <Ticketcustom
        src="src/assets/wing/wing1.png"
        alt="wing1.png"
        type="wing"
      />
      <Ticketcustom
        src="src/assets/wing/wing2.png"
        alt="wing2.png"
        type="wing"
      />
      <Ticketcustom src="/wing/wing3.png" alt="wing3.png" type="wing" />
      <Ticketcustom src="/wing/wing4.png" alt="wing4.png" type="wing" />
      <Ticketcustom src="/wing/wing5.png" alt="wing5.png" type="wing" />
    </div>
  );
};

export default Wings;
