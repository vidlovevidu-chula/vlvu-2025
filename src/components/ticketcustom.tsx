import React from "react";
import { useStore } from "@nanostores/react";
import { edgeType, bgType, style, wing, prop } from "../store";

interface TicketCustomProps {
  src: string;
  alt: string;
  type: string;
}

const Customticket: React.FC<TicketCustomProps> = ({ src, alt, type }) => {
  const $edgeType = useStore(edgeType);
  const $bgType = useStore(bgType);
  const $style = useStore(style);
  const $wing = useStore(wing);
  const $prop = useStore(prop);

  const data = {
    edgeType: $edgeType,
    bgType: $bgType,
    style: $style,
    wing: $wing,
    prop: $prop,
  };

  const changeItem = (item_name: string, alt: string) => {
    switch (item_name) {
      case "edge":
        edgeType.set(alt);
        data.edgeType = alt;
        break;
      case "background":
        if ($bgType === alt) {
          bgType.set("");
          data.bgType = "";
          break;
        }
        bgType.set(alt);
        data.bgType = alt;
        break;
      case "style":
        if ($style === alt) {
          style.set("");
          data.style = "";
          break;
        }
        style.set(alt);
        data.style = alt;
        break;
      case "wing":
        if ($wing === alt) {
          wing.set("");
          data.wing = "";
          break;
        }
        wing.set(alt);
        data.wing = alt;
        break;
      case "prop":
        if ($prop === alt) {
          prop.set("");
          data.prop = "";
        }
        prop.set(alt);
        data.prop = alt;
        break;
    }
    localStorage.setItem("chars", JSON.stringify(data));
    console.log("Test", data);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`cursor-pointer object-cover
        ${type === "style" ? "h-[200px] w-[100px] object-[-68px_-30px]" : ""} 
        ${type === "edge" ? "m-[8px] h-[100px]" : ""}
        ${type === "wing" ? "h-[200px] w-[100px] object-[-100px_0px]" : ""}
        ${type === "prop" ? "h-[200px] w-[100px] object-[-10px_-15px]" : ""}`}
      onClick={() => {
        changeItem(type, alt);
        console.log("type,alt :", type, alt);
      }}
    />
  );
};

export default Customticket;
