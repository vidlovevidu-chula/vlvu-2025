// import type * as React from "react";
import React, { useEffect, useState } from "react";
import type { FlowerType } from "./FlowerGameContainer";
import { twMerge } from "tailwind-merge";
import type { GifScene } from "./FirstHalfQuestions";

interface Props {
  flowerType: FlowerType;
  showIntro: boolean;
  scenes: GifScene[];
  onRetakeQuiz: () => void;
}
export const ResultPage: React.FC<Props> = ({
  flowerType,
  showIntro,
  scenes,
  onRetakeQuiz,
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
        <div className="w-[85%] h-[80%] flex flex-col absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {showIntro && <h1>Intro</h1>}
          <p className="w-full h-full bg-white">
            Your flower is {flowerType}
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quo
            quos sit maiores, similique nesciunt ut velit possimus explicabo
            quam porro numquam ab ea corporis.
          </p>
          <div className="flex justify-center gap-[2%] my-[2%]">
            <button
              className="w-[35%]"
              onClick={() => setShowResult(!showResult)}
              {...props}
            >
              <img
                className="w-full"
                alt="Close"
                src="/images/bouquetButton.webp"
              />
            </button>
            <button
              className="w-[35%]"
              onClick={() => setShowResult(!showResult)}
              {...props}
            >
              <img
                className="w-full"
                alt="Close"
                src="/images/saveButton.webp"
              />
            </button>
          </div>
          <a
            className="text-white font-Ribbon text-center text-lg max-[450px]:text-[4vw]"
            href="/"
          >
            {`<< `}
            <span className="underline">กลับไปหน้าหลัก</span>
          </a>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
