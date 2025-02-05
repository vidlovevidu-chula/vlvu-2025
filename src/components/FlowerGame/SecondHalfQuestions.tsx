import type * as React from "react";
import type { FlowerGroup, FlowerType } from "./FlowerGameContainer";

interface Props {
  questionNumber: number;
  group: FlowerGroup;
  onSecondHalfAnswer: (typeNumber: FlowerType) => unknown;
}
export const SecondHalfQuestions: React.FC<Props> = ({
  questionNumber,
  group,
  onSecondHalfAnswer,
}) => {
  return (
    <>
      <h1>You are in {group}</h1>
      <h1>Question {questionNumber}</h1>
      <div className="flex gap-x-2">
        {group === "charity" ? (
          <>
            <button onClick={() => onSecondHalfAnswer(5)}>five</button>
            <button onClick={() => onSecondHalfAnswer(6)}>six</button>
            <button onClick={() => onSecondHalfAnswer(7)}>seven</button>
          </>
        ) : group === "harmony" ? (
          <>
            <button onClick={() => onSecondHalfAnswer(2)}>two</button>
            <button onClick={() => onSecondHalfAnswer(3)}>three</button>
            <button onClick={() => onSecondHalfAnswer(4)}>four</button>
          </>
        ) : (
          <>
            <button onClick={() => onSecondHalfAnswer(1)}>one</button>
            <button onClick={() => onSecondHalfAnswer(8)}>eight</button>
            <button onClick={() => onSecondHalfAnswer(9)}>nine</button>
          </>
        )}
      </div>
    </>
  );
};
