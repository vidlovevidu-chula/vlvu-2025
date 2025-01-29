import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselComponent() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );

  // Predefined array of image paths
  const imagePaths = [
    "/images/Carousel/Slider 1.png",
    "/images/Carousel/Slider 2.png",
    "/images/Carousel/Slider 3.png",
    "/images/Carousel/Slider 4.png",
    "/images/Carousel/Slider 5.png",
  ];

  // Predefined array of overlay texts with header and details
  const overlayTexts = [
    { header: "Slide 1 Header", details: "Slide 1 Details" },
    { header: "Slide 2 Header", details: "Slide 2 Details" },
    { header: "Slide 3 Header", details: "Slide 3 Details" },
    { header: "Slide 4 Header", details: "Slide 4 Details" },
    { header: "Slide 5 Header", details: "Slide 5 Details" },
  ];

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-[369px] h-[215px] flex items-center justify-center"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {imagePaths.map((path, index) => (
          <CarouselItem key={index}>
            <Card className="rounded-3xl">
              <CardContent className="w-full h-full flex p-0 relative">
                <img
                  src={path}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover rounded-3xl"
                />
                <div className="absolute bottom-0 left-0 w-full text-white p-2 text-end rounded-b-3xl font-sans">
                  <h3 className="text-xl font-bold">
                    {overlayTexts[index].header}
                  </h3>
                  <p className="text-[11px]">{overlayTexts[index].details}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="mx-3 bg-transparent" />
      <CarouselNext className="mx-3 bg-transparent" />
    </Carousel>
  );
}
