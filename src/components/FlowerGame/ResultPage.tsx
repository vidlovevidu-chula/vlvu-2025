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
  const [currentScene, setCurrentScene] = useState(
    showIntro ? 0 : scenes.length - 1, // use last scene if showIntro is false
  );
  const [showResult, setShowResult] = useState(false);

  const { url, buttonImageUrl, className, duration, ...props } =
    scenes?.[currentScene] || {};

  const flowerList: string[] = [
    "Calla Lily",
    "Pink Rose",
    "Tulip",
    "Gerbera",
    "Lavender",
    "Sunflower",
    "Bougainvillea",
    "Orchid",
    "Chamomile",
  ];

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
      {currentScene == scenes.length - 1 ? (
        <button
          className={twMerge(
            //"absolute -bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%]",
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%]",
          )}
          onClick={() => setShowResult(!showResult)}
          {...props}
        >
          <img
            className="w-full animate-zoomIn drop-shadow-[-2px_-2px_10px_rgba(255,255,200,0.5)]"
            src={`/images/flowers/` + flowerType + `.webp`}
            alt={`flower type: ` + flowerType}
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


        <div className="w-[100%] h-[100%] flex flex-col absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img
              alt="card"
              src={`/images/cards/` + flowerList[flowerType - 1] + `.webp`}
            />
            <div
              className="absolute top-[88%] left-1/2 -translate-x-1/2 -translate-y-1/2
            flex justify-center w-full gap-[2%] mt-[2%]"

            >
              <button
                className="w-[30%]"
                onClick={() => setShowResult(!showResult)}
                {...props}
              >
                <img
                  className="w-full"
                  alt="Close"
                  src="/images/bouquetButton.webp"
                />
              </button>
              <a
                className="w-[30%] flex"
                href={`/images/cards/` + flowerList[flowerType - 1] + `.png`}
                download
              >
                <button className="w-full" {...props}>
                  <img
                    className="w-full m-0"
                    alt="Download"
                    src="/images/saveButton.webp"
                  />
                </button>
              </a>
            </div>
            <div
              className="absolute top-[95%] left-1/2 -translate-x-1/2 -translate-y-1/2
            flex justify-between w-full gap-[2%] mt-[2%] px-4 font-Ribbon
            text-white drop-shadow-[0px_0px_2px_rgba(0,0,0,1)]"
            >
              <a
                className="text-center text-2xl max-[450px]:text-[5vw]"
                href="/"
              >
                {`<< `}
                <span className="underline">กลับไปหน้าหลัก</span>
              </a>
              <button
                className="text-center text-2xl max-[450px]:text-[5vw]"
                onClick={onRetakeQuiz}
              >
                <span className="underline">ลองทำอีกรอบ</span>
                {` >>`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
