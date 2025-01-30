import React from "react";
import { useStore } from "@nanostores/react";
import { page } from "../store";
import Edge from "./cupid/edge";
import Style from "./cupid/style";
import Wing from "./cupid/wing";
import Prop from "./cupid/prop";

const Page = () => {
  const $pageName = useStore(page) || "Edge";

  return (
    <>
      {$pageName === "Edge" ? <Edge /> : null}
      {$pageName === "Style" ? <Style /> : null}
      {$pageName === "Wing" ? <Wing /> : null}
      {$pageName === "Prop" ? <Prop /> : null}
    </>
  );
};

export default Page;
