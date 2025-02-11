import React from "react";
import Ticketcustom from "../ticketcustom";
const Props = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/prop/prop1.webp" alt="prop1" type="prop" />
      <Ticketcustom src="/prop/prop2.webp" alt="prop2" type="prop" />
      <Ticketcustom src="/prop/prop3.webp" alt="prop3" type="prop" />
      <Ticketcustom src="/prop/prop4.webp" alt="prop4" type="prop" />
      <Ticketcustom src="/prop/prop5.webp" alt="prop5" type="prop" />
      <Ticketcustom src="/prop/prop6.webp" alt="prop6" type="prop" />
      <Ticketcustom src="/prop/prop7.webp" alt="prop7" type="prop" />
    </div>
  );
};

export default Props;
