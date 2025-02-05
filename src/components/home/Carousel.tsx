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
    "/images/home/Carousel/Carousel-1.webp",
    "/images/home/Carousel/Carousel-2.webp",
    "/images/home/Carousel/Carousel-3.webp",
    "/images/home/Carousel/Carousel-4.webp",
    "/images/home/Carousel/Carousel-5.webp",
  ];

  // Predefined array of overlay texts with header and details
  const overlayTexts = [
    { header: "อัคคีสลาตัน", details: "โกเอ็นจิ ชูยะ" },
    { header: "น่ากลัวจังเลย", details: "คาจิม่าและอิจิโนเสะ" },
    { header: "คุณตาครับ", details: "เอ็นโด มาโมรุ" },
    { header: "เพื่อนรักหันหลังใส่กัน", details: "โกเอ็นจิและลูกสมุนของเขา" },
    { header: "เบียวอิคิเท็นไค", details: "โกะโจ ซาโตรุ" },
  ];

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-[368px] h-[215px] flex items-center justify-center"
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

export const CarouselForSponsors = () => {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm"
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
};
