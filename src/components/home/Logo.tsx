import * as React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center items-center gap-1 pt-2">
      <img src="/images/home/vidva.webp" className="w-10" />
      <img src="/images/home/vlvu.webp" className="w-10" />
      <img src="/images/home/vidya.webp" className="w-10 ml-2" />
    </div>
  );
};
export default Logo;
