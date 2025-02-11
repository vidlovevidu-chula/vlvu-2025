import React from "react";
import Ticketcustom from "../ticketcustom";
const Styles = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/style/style1.webp" alt="style1" type="style" />
      <Ticketcustom src="/style/style2.webp" alt="style2" type="style" />
      <Ticketcustom src="/style/style3.webp" alt="style3" type="style" />
      <Ticketcustom src="/style/style4.webp" alt="style4" type="style" />
      <Ticketcustom src="/style/style5.webp" alt="style5" type="style" />
      <Ticketcustom src="/style/style6.webp" alt="style6" type="style" />
    </div>
  );
};

export default Styles;
