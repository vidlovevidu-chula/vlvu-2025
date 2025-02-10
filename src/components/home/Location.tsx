import React from "react";

const Location: React.FC = () => {
  return (
    <div className="w-full h-auto flex flex-col justify-center items-center px-8">
      <img
        src="/images/home/map.webp"
        width="100%"
        height="auto"
        alt="Larnchak x Larngear"
        title="Larnchak x Larngear"
        className="rounded-lg"
        onClick={() =>
          window.open("https://maps.app.goo.gl/nrZ8TXM34Ep26iqa9", "_blank")
        }
      />
      <div className="flex items-center justify-center space-x-6 py-2">
        <img src="/images/home/mark.webp" alt="mark" width={20} />
        {/* First Column */}
        <div className="text-center">
          <p className="text-md font-Ovo">Larnchak</p>
          <p className="text-sm font-NotoSansThai">ลานจักร</p>
        </div>
        {/* Separator */}
        <p className="text-2xl font-semibold">×</p>
        {/* Second Column */}
        <div className="text-center">
          <p className="text-md font-Ovo">Larn Intania</p>
          <p className="text-sm font-NotoSansThai">ลานอินทาเนีย</p>
        </div>
      </div>
    </div>
  );
};

export default Location;
