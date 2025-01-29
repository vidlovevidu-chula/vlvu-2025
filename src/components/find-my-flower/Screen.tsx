import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface GifScene
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  url: string | { url: string; className: string }[];
  buttonImageUrl?: string;
  duration?: number;
}

export interface FindYourFlowerScreenProps {
  scenes: GifScene[];
}

export const FindYourFlowerScreen: React.FC<FindYourFlowerScreenProps> = ({
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
    <div className="max-w-screen-sm w-fit max-h-[80vh] relative">
      {Array.isArray(url) ? (
        url.map(({ url, className }, index) => (
          <img key={index} className={className} src={url} alt="scene" />
        ))
      ) : (
        <img className="w-full" src={url} alt="scene" />
      )}
      {buttonImageUrl && (
        <button
          className={twMerge("absolute top-0", className)}
          onClick={() => setCurrentScene((prev) => prev + 1)}
          {...props}
        >
          <img src={buttonImageUrl} alt="next" />
        </button>
      )}
    </div>
  );
};
