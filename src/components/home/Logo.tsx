import * as React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex justify-between items-center px-4 pt-2">
      <div className="flex items-center">
        <img src="/images/home/vidva.webp" className="w-10" />
        <img src="/images/home/vidya.webp" className="w-10" />
      </div>
      <img src="/images/home/vlvu.webp" className="w-10" />
    </div>
  );
};
export default Logo;
