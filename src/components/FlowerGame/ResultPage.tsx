import type * as React from "react";
import type { FlowerType } from "./FlowerGameContainer";

interface Props {
  flowerType: FlowerType;
  showIntro: boolean;
  onRetakeQuiz: () => void;
}
export const ResultPage: React.FC<Props> = ({
  flowerType,
  showIntro,
  onRetakeQuiz,
}) => {
  return (
    <div>
      {showIntro && <h1>Intro</h1>}
      <h1>Your flower is {flowerType}</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quo
        quos sit maiores, similique nesciunt ut velit possimus explicabo quam
        porro numquam ab ea corporis.
      </p>
      <button onClick={onRetakeQuiz}>ลองทำอีกรอบ</button>
    </div>
  );
};
