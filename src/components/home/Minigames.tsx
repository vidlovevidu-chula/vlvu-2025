import * as React from "react";

const Minigames: React.FC = () => {
  return (
    <div className="h-auto w-full flex flex-col items-center justify-center gap-4">
      <img
        src="/images/home/minigames/minigames_title.webp"
        width={360}
        height={238}
        className="animate-fadeUp"
        id="minigames-title"
      />

      {/* Flower game */}
      <div className="flex w-full justify-evenly items-center animate-fadeUp">
        <img
          src="/images/home/minigames/flower-game.webp"
          width={120}
          height={120}
          alt="Find My Flower"
          id="flower-game"
        />
        <div className="text-center leading-tight flex flex-col gap-1 font-Ovo font-semibold">
          <h2 className="text-xl text-blackbrown"> Find My Flower </h2>
          <a
            href="#"
            className="text-lg text-blackrose"
            onClick={() => alert("Coming soon!")}
          >
            {" "}
            Click to Play{" "}
          </a>
        </div>
      </div>

      {/* Ticket Game */}
      <div className="flex w-full justify-evenly items-center mt-8 animate-fadeUp">
        <div className="text-center leading-tight flex flex-col gap-1 font-Ovo font-semibold">
          <h2 className="text-xl text-blackbrown"> Oh! My Love god </h2>
          <a
            href="#"
            className="text-lg text-blackrose"
            onClick={() => alert("Coming soon!")}
          >
            {" "}
            Click to Create{" "}
          </a>
        </div>
        <img
          src="/images/home/minigames/ticket-game.webp"
          width={120}
          height={120}
          alt="Customize My Ticket"
          id="ticket-game"
        />
      </div>

      {/* Stamp game */}
      <div className="flex w-full justify-evenly items-center mt-8 animate-fadeUp">
        <img
          src="/images/home/minigames/stamp-game.webp"
          width={150}
          height={150}
          alt="Collect My Stamp"
          id="stamp-game"
        />
        <div className="text-center leading-tight flex flex-col gap-1 font-Ovo font-semibold">
          <h2 className="text-xl text-blackbrown"> My Stamp Collection </h2>
          <a
            href="#"
            className="text-lg text-blackrose"
            onClick={() => alert("Coming soon!")}
          >
            {" "}
            Click to Collect{" "}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Minigames;
