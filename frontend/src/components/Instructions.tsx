import React, { useState } from "react";

const Instructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 bg-gray-800 p-6 rounded-lg">
      <h1
        className="text-xl cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        How to Play
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </h1>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <p className="text-lg mt-4">
          To start, join a room and add in $10.00 USD to play a game. You will
          spawn as a Pacman, control using your keyboard arrow keys and eat the
          dots for money. If you manage to eat a large dot, you can eat other
          players to try to take their coins. If you win, you'll receive the
          entire game winnings pot.
        </p>
      </div>
    </div>
  );
};

export default Instructions;
