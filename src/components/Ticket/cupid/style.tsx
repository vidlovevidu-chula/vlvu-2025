import React from "react";
import Ticketcustom from "../ticketcustom";
const Styles = () => {
  return (
    <div className="flex flex-row">
      <Ticketcustom src="/style/style1.png" alt="style1.png" type="style" />
      <Ticketcustom src="/style/style2.png" alt="style2.png" type="style" />
      <Ticketcustom src="/style/style3.png" alt="style3.png" type="style" />
      <Ticketcustom src="/style/style4.png" alt="style4.png" type="style" />
      <Ticketcustom src="/style/style5.png" alt="style5.png" type="style" />
      <Ticketcustom src="/style/style6.png" alt="style6.png" type="style" />
    </div>
  );
};

export default Styles;
