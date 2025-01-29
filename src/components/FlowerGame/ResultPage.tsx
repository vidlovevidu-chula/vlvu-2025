import type * as React from "react";
import type { FlowerType } from "./FlowerGameContainer";

// const FLOWER_TYPE_NAME, FLOWER_TYPE_DESCRIPTIONS = ...

interface Props {
  flowerType: FlowerType;
}
export const ResultPage: React.FC<Props> = ({ flowerType }) => {
  return (
    <div>
      <h1>Your flower is {flowerType}</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quo
        quos sit maiores, similique nesciunt ut velit possimus explicabo quam
        porro numquam ab ea corporis.
      </p>
    </div>
  );
};
