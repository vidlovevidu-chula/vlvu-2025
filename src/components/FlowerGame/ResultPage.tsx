// import type * as React from "react";
import React, { useEffect, useState } from "react";
import type { FlowerType } from "./FlowerGameContainer";
import { twMerge } from "tailwind-merge";
import type { GifScene } from "./FirstHalfQuestions";

// const FLOWER_TYPE_NAME, FLOWER_TYPE_DESCRIPTIONS = ...

interface Props {
  flowerType: FlowerType;
  showIntro: boolean;
  scenes: GifScene[];
}
export const ResultPage: React.FC<Props> = ({
  flowerType,
  showIntro,
  scenes,
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const { url, buttonImageUrl, className, duration, ...props } =
    scenes?.[currentScene] || {};

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
      {buttonImageUrl && currentScene == scenes.length - 1 ? (
        <button
          className={twMerge(
            //"absolute -bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%]",
            "border border-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%]",
          )}
          onClick={() => setShowResult(!showResult)}
          {...props}
        >
          <img
            className="w-full animate-zoomIn"
            src={buttonImageUrl}
            alt="next"
          />
        </button>
      ) : (
        <button
          className={twMerge("absolute", className)}
          onClick={() => setCurrentScene((prev) => prev + 1)}
          {...props}
        >
          <img src={buttonImageUrl} alt="next" />
        </button>
      )}
      {showResult ? (
        <div className="w-[80%] h-[70%] absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {showIntro && <h1>Intro</h1>}
          <h1>Your flower is {flowerType}</h1>
          <p className="w-full h-full bg-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quo
            quos sit maiores, similique nesciunt ut velit possimus explicabo
            quam porro numquam ab ea corporis.
          </p>
          <div className="flex justify-evenly my-[3%]">
            <button
              className="w-[45%]"
              onClick={() => setShowResult(!showResult)}
              {...props}
            >
              <img
                className="w-full"
                alt="Close"
                src="/images/bouquetButton.png"
              />
            </button>
            <button
              className="w-[45%]"
              onClick={() => setShowResult(!showResult)}
              {...props}
            >
              <img
                className="w-full"
                alt="Close"
                src="/images/saveButton.png"
              />
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
