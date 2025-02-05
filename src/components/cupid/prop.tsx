import React from "react";
import Ticketcustom from "../ticketcustom";
const Props = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/prop/prop1.png" alt="prop1.png" type="prop" />
      <Ticketcustom src="/prop/prop2.png" alt="prop2.png" type="prop" />
      <Ticketcustom src="/prop/prop3.png" alt="prop3.png" type="prop" />
      <Ticketcustom src="/prop/prop4.png" alt="prop4.png" type="prop" />
      <Ticketcustom src="/prop/prop5.png" alt="prop5.png" type="prop" />
      <Ticketcustom src="/prop/prop6.png" alt="prop6.png" type="prop" />
      <Ticketcustom src="/prop/prop7.png" alt="prop7.png" type="prop" />
    </div>
  );
};

export default Props;
