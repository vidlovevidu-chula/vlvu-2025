import type * as React from "react";
import type { FlowerGroup, FlowerType } from "./FlowerGameContainer";

interface BaseQuestionProps {
  questionNumber: number;
}
interface FirstHalfProps extends BaseQuestionProps {
  onFirstHalfAnswer: (group: FlowerGroup) => unknown;
}
interface SecondHalfProps extends BaseQuestionProps {
  group: FlowerGroup;
  onSecondHalfAnswer: (typeNumber: FlowerType) => unknown;
}

export const FirstHalfQuestions: React.FC<FirstHalfProps> = ({
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

export const SecondHalfQuestions: React.FC<SecondHalfProps> = ({
  questionNumber,
  group,
  onSecondHalfAnswer,
}) => {
  return (
    <>
      <h1>You are in {group}</h1>
      <h1>Question {questionNumber}</h1>
      <div className="flex gap-x-2">
        <button onClick={() => onSecondHalfAnswer(5)}>five</button>
        <button onClick={() => onSecondHalfAnswer(6)}>six</button>
        <button onClick={() => onSecondHalfAnswer(7)}>seven</button>
      </div>
    </>
  );
};
