import type * as React from "react";
import type { FlowerGroup } from "./FlowerGameContainer";

interface Props {
  questionNumber: number;
  onFirstHalfAnswer: (group: FlowerGroup) => unknown;
}
export const FirstHalfQuestions: React.FC<Props> = ({
  questionNumber,
  onFirstHalfAnswer,
}) => {
  return (
    <>
      <h1 className="text-red-500">Question {questionNumber}</h1>
      <div className="flex flex-col gap-x-2 gap-y-10 text-red-500 max-[450px]:gap-y-[8vw] max-[450px]:text-[4vw]">
        <button
          className="border border-red-500 max-[450px]:h-[7wv]"
          onClick={() => onFirstHalfAnswer("charity")}
        >
          charity
        </button>
        <button
          className="border border-red-500"
          onClick={() => onFirstHalfAnswer("sensory")}
        >
          sensory
        </button>
        <button
          className="border border-red-500"
          onClick={() => onFirstHalfAnswer("harmony")}
        >
          harmony
        </button>
      </div>
    </>
  );
};
