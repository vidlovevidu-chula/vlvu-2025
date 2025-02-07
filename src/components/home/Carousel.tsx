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
    "/images/home/Carousel/wristband.jpg",
    "/images/home/Carousel/stage.webp",
    "/images/home/Carousel/dance.jpeg",
    "/images/home/Carousel/fortune.jpeg",
    "/images/home/Carousel/blinddate.webp",
    "/images/home/Carousel/market.jpg",
  ];

  // Predefined array of overlay texts with header and details
  const overlayTexts = [
    { header: "Special for Register", details: "พิเศษสำหรับผู้ลงทะเบียน! ไม่ว่าคุณจะเป็น #ทีมโสด #ทีมมีคู่ หรือ #ทีมไม่อยากบอก รับไปเลย Wristband สุด Exclusive มีจำนวนจำกัด 1000 ชิ้น แจกเฉพาะวันงาน First come, First serve!" },
    { header: "พบกับ Highlight Stage", details: "“ความรักจะไปทางไหน? ถามใจเธอดู” มาฟังการโต้วาทีสุดจี๊ด แล้วต่อด้วยคอนเสิร์ตสุดมันส์ ที่ลานอินทาเนีย บอกเลยว่า แสง สี แสง จัดเต็ม! สนุกสุดเหวี่ยงแบบนี้ คนโสดอาจสะดุดเจอรักแท้ก็ได้นะ" },
    { header: "สายแดนซ์ตัวจริงห้ามพลาด", details: "เปิดพื้นที่โชว์สเตป ปลุกความเป็นเมนแดนซ์ในตัวคุณ! ไม่ว่าจะ Dance Show หรือ Random Dance มาขยับร่างกายไปตามจังหวะสนุก ๆ นี้ แล้วมาดูกันว่า ลานอินทาเนียจะลุกเป็นไฟแค่ไหน?!" },
    { header: "ดวงของเธอฉันขอดูนะ", details: "1 ใน 8 บูธกิจกรรมสุดสนุก! ถ้าอยากรู้ว่าอนาคตจะไปทางไหน ไม่ว่าจะเรื่องความรัก การเรียน การงาน มาดูดวงกับผู้เชี่ยวชาญที่ลานจักรพงษ์! เปิดไพ่ไขความลับ แล้วมาดูกันว่า ดวงของคุณจะบอกอะไร!" },
    { header: "ระวังสิ้นสุดทางโสด", details: "Next Station: Love คนโสดเตรียมตัวให้พร้อม เปิดตาเปิดใจ มาพบกับใครบางคน ที่อาจเป็น (soul)mate ของคุณ! มาพูดคุยให้หัวใจเต้นแรงในบูธ Blind Date ที่สวนรวมใจ!" },
    { header: "อร่อยตัวแตก เพื่อนต้องแบกกลับบ้าน", details: "เพลิดเพลินกับกิจกรรมแล้ว อย่าลืมแวะมาเติมพลังที่ Market zone! อิ่มอร่อยกับของคาวจานเด็ด              ขนมหวานสุดฟิน และเครื่องดื่มเติมความสดชื่น พร้อมลุยกับความสนุกต่อแบบไม่มีสะดุด!" }
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
                <div className="absolute bottom-0 left-0 w-full text-white p-2 text-end rounded-b-3xl font-NotoSansThai bg-black bg-opacity-20 rounded-t-lg">
                  <h3 className="text-xl font-bold">
                    {overlayTexts[index].header}
                  </h3>
                  <p className="text-[12px]">{overlayTexts[index].details}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

