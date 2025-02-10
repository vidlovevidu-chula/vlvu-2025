import {
  Parallax,
  ParallaxLayer,
  type IParallax,
} from "@react-spring/parallax";
import { CarouselComponent } from "./Carousel";
import Minigames from "./Minigames";
import WebTitle from "./WebTitle";
import Location from "./Location";
import Sponsors from "./Sponsors";
import React, { useRef } from "react";
import Logo from "./Logo";

export function Home() {
  const parallaxRed = useRef<IParallax>(null);

  return (
    <Parallax
      pages={3.85}
      ref={parallaxRed}
      style={{
        width: "100%",
        maxWidth: "448px",
        margin: "0 auto",
        touchAction: "none",
      }}
      config={{ tension: 180, friction: 26 }} // Smoother animations
    >
      {/* Landing Page */}
      <ParallaxLayer offset={0} speed={0.2}>
        <Logo />
        <img
          src="../images/home/decorations/cloud.webp"
          className="absolute left-10 top-40 w-60"
          style={{ transform: "scaleX(-1)" }}
        />
        <a
          href="https://www.instagram.com/min.taadaa/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="../images/home/decorations/cloud.webp"
            className="absolute bottom-0 -right-10 w-48"
          />
        </a>
        <WebTitle />
      </ParallaxLayer>

      {/* Mini Games Section */}
      <ParallaxLayer offset={1} speed={0.05} factor={0.6}>
        <div className="flex flex-col h-full">
          <img
            src="../images/home/decorations/deco3.webp"
            className="absolute top-44 left-10 w-10"
          />
          <Minigames />
          <a
            href="https://www.instagram.com/aemonpm/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="../images/home/decorations/deco4.webp"
              className="absolute -right-3 -bottom-1/3 w-20"
            />
          </a>
        </div>
      </ParallaxLayer>

      {/* Carousel Section */}
      <ParallaxLayer offset={2} speed={0.1} factor={0.5}>
        <img
          src="/images/home/decorations/cupidvidva.webp"
          className="relative w-32 left-4"
          style={{ transform: "scaleX(-1) rotate(-35deg)" }}
        />
        <CarouselComponent />
        <img
          src="/images/home/decorations/cupidvidya.webp"
          className="relative w-32 left-2/3 mt-2"
          style={{ transform: "rotate(55deg)" }}
        />
      </ParallaxLayer>

      {/* Map Section */}
      <ParallaxLayer offset={2.7} speed={0.2} factor={0.6}>
        <div className="flex flex-col h-full gap-2">
          <img
            src="/images/home/decorations/deco1.webp"
            className="absolute w-20 -ml-6 -top-16"
          />
          <p className="text-center text-blackrose text-md font-Yeseva font-bold py-6">
            Be a lover. Give love. Choose love, always.
          </p>
          <Location />
        </div>
      </ParallaxLayer>

      {/* Sponsors Section */}
      <ParallaxLayer
        offset={3.1}
        speed={0.12}
        factor={0.85}
        style={{
          backgroundImage: "url('/images/home/sponbg.webp')",
          backgroundSize: "550px auto",
          backgroundPosition: "bottom",
        }}
      >
        <div className="flex flex-col h-full">
          <Sponsors />
        </div>
      </ParallaxLayer>
    </Parallax>
  );
}
