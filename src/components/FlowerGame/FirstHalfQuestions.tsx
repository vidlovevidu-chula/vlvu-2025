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
      <h1>Question {questionNumber}</h1>
      <div className="flex gap-x-2">
        <button onClick={() => onFirstHalfAnswer("charity")}>Charity</button>
        <button onClick={() => onFirstHalfAnswer("sensory")}>Sensory</button>
        <button onClick={() => onFirstHalfAnswer("harmony")}>Harmony</button>
      </div>
    </>
  );
};
