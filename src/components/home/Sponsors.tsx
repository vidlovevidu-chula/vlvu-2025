import React from 'react';

const Sponsors: React.FC = () => {
  return (
    <div className="flex flex-col w-full py-2 px-10 h-auto items-center justify-center">
      <h2 className="text-3xl text-blackrose font-Yeseva font-bold p-4">Special Thanks!</h2>
      <div className="w-full grid grid-cols-4 justify-items-center gap-y-2">
        <img
          src="../images/home/sponsors/bewild.webp"
          className={"w-auto h-[70px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/mansome.webp"
          className={"w-auto h-[70px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/molto.webp"
          className={"w-auto h-[70px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/ido360.webp"
          className={"w-auto h-[70px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/2a.webp"
          className={"w-auto h-[45px] rounded-lg shadow-xl bg-white"}
        />
        <img
          src="../images/home/sponsors/huisuki.webp"
          className={"w-auto h-[45px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/onetouch.webp"
          className={"w-auto h-[45px] rounded-lg shadow-xl"}
        />
        <img
          src="../images/home/sponsors/koke.webp"
          className={"w-auto h-[45px] rounded-lg shadow-xl bg-white"}
        />
      </div>
    </div>
  );
};

export default Sponsors;
