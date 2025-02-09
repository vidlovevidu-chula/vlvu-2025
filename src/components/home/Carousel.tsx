import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export function CarouselComponent() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );

  // Predefined array of image paths
  const imagePaths = [
    "/images/home/Carousel/stage.webp",
    "/images/home/Carousel/dance.jpeg",
    "/images/home/Carousel/fortune.jpeg",
    "/images/home/Carousel/blinddate.webp",
    "/images/home/Carousel/market.jpg",
  ];

  // Predefined array of overlay texts with header and details
  const overlayTexts = [
    {
      header: "พบกับ Highlight Stage",
      details:
        "“ความรักจะไปทางไหน? ถามใจเธอดู” มาฟังการโต้วาทีสุดจี๊ด แล้วต่อด้วยคอนเสิร์ตสุดมันส์ ที่ลานอินทาเนีย",
      tags: ["#HighlightStage", "#คอนเสิร์ต", "#ความรัก"],
    },
    {
      header: "สายแดนซ์ตัวจริงห้ามพลาด",
      details:
        "โชว์สเตป ปลุกเมนแดนซ์ในตัวคุณ! Dance Show หรือ Random Dance มาสนุกที่ลานอินทาเนีย แล้วลุกร้อนสุดมันส์!",
      tags: ["#DanceShow", "#RandomDance", "#สายแดนซ์"],
    },
    {
      header: "ดวงของเธอฉันขอดูนะ",
      details:
        "1 ใน 8 บูธสุดสนุก! เปิดไพ่ดูดวงความรัก การเรียน การงาน กับผู้เชี่ยวชาญที่ลานจักรพงษ์!",
      tags: ["#ดวง", "#ความรัก", "#เรียน", "#งาน"],
    },
    {
      header: "ระวังสิ้นสุดทางโสด",
      details:
        "Next Station: Love! คนโสดพร้อมเปิดใจ มาพบ (soul)mate พูดคุยสุดฟินในบูธ Blind Date ที่สวนรวมใจ!",
      tags: ["#BlindDate", "#โสด", "#คนโสด"],
    },
    {
      header: "อร่อยตัวแตก เพื่อนต้องแบกกลับบ้าน",
      details:
        "สนุกแล้วแวะเติมพลังที่ Market Zone! อิ่มอร่อยกับอาหาร ขนม เครื่องดื่มสดชื่น พร้อมลุยต่อแบบไม่มีสะดุด!",
      tags: ["#MarketZone", "#อาหาร", "#ขนม", "#เครื่องดื่ม"],
    },
  ];

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full p-4 h-[215px] flex items-center justify-center"
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
                <div className="absolute bottom-0 left-0 w-full text-white p-2 text-end rounded-b-3xl font-NotoSansThai drop-shadow-lg">
                  <h3 className="text-xl font-bold text-shadow-lg">
                    {overlayTexts[index].header}
                  </h3>
                  <p className="text-[12px] text-shadow-lg">
                    {overlayTexts[index].details}
                  </p>
                  <p className="text-[12px] text-lightpink font-semibold text-shadow-lg">
                    {overlayTexts[index].tags?.join(" ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
