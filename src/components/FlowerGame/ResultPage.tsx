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
      {buttonImageUrl && (
        <button
          className={twMerge("absolute", className)}
          onClick={() => setCurrentScene((prev) => prev + 1)}
          {...props}
        >
          <img src={buttonImageUrl} alt="next" />
        </button>
      )}
      {currentScene == scenes.length ? (
        <div className="bg-white">
          {showIntro && <h1>Intro</h1>}
          <h1>Your flower is {flowerType}</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quo
            quos sit maiores, similique nesciunt ut velit possimus explicabo
            quam porro numquam ab ea corporis.
          </p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
