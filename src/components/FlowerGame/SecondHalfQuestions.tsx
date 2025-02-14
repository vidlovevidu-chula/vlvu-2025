// import type * as React from "react";
import React, { useEffect, useState } from "react";
import type { FlowerGroup, FlowerType } from "./FlowerGameContainer";
import { twMerge } from "tailwind-merge";
import type { GifScene } from "./FirstHalfQuestions";

interface Props {
  questionNumber: number;
  group: FlowerGroup;
  onSecondHalfAnswer: (typeNumber: FlowerType) => unknown;
  scenes: GifScene[][];
}
export const SecondHalfQuestions: React.FC<Props> = ({
  questionNumber,
  group,
  onSecondHalfAnswer,
  scenes,
}) => {
  const [currentScene, setCurrentScene] = useState(0);

  let groupNum = 0;
  if (group == "sensory") groupNum = 0;
  else if (group == "charity") groupNum = 1;
  else groupNum = 2;

  const { url, buttonImageUrl, className, duration, q, ...props } =
    scenes[groupNum]?.[currentScene] || {};

  useEffect(() => {
    if (buttonImageUrl || !duration) return;

    setTimeout(() => {
      setCurrentScene((prev) => prev + 1);
    }, duration);
  }, [currentScene]);
  return (
    <div className="max-w-screen-sm w-full max-h-screen relative">
      {Array.isArray(url) ? (
        url.map(({ url, className }, index) => (
          <img key={index} className={className} src={url} alt="scene" />
        ))
      ) : (
        <img className="w-full" src={url} alt="scene" />
      )}
      {buttonImageUrl && (
        <button
          className={twMerge("absolute", className)}
          onClick={() => setCurrentScene((prev) => prev + 1)}
          {...props}
        >
          <img src={buttonImageUrl} alt="next" />
        </button>
      )}
      {q && (
        <div
          className={twMerge(
            `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 h-3/6`,
            className,
          )}
        >
          <div className="relative">
            <img
              className="justify-self-center w-full  animate-fadeIn"
              src={q.boardImageUrl}
              alt="board-image"
            />
            <form
              id="question"
              className="text-transparent absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 max-[450px]:text-[4vw]"
              onSubmit={() => {
                setCurrentScene((prev) => prev + 1);
              }}
            >
              <h1 className="">
                You are in {group} Question {questionNumber}
              </h1>
              <div className="flex flex-col gap-x-2 gap-y-10 max-[450px]:gap-y-[8vw]">
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
                    <button onClick={() => onSecondHalfAnswer(9)}>nine</button>
                    <button onClick={() => onSecondHalfAnswer(1)}>one</button>
                    <button onClick={() => onSecondHalfAnswer(8)}>eight</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
