import React, { useState } from "react";

const LandingPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <header className="relative bg-[#080707] h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative text-center max-w-4xl">
          <h1 className="text-6xl font-bold drop-shadow-lg text-[#fdfc02]">
            Welcome to PacRoyale!
          </h1>
          <p className="mt-4 text-xl font-light">
            Battle it out in this thrilling Pacman-inspired game to win the pot.
          </p>
          <button className="mt-6 bg-black text-yellow-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-900">
            Play Now
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-900">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#fd0001]">Game Features</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#013d36] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-[#00ffdf]">Competitive Play</h3>
            <p>
              Join rooms, compete against others, and claim victory to win real
              rewards.
            </p>
          </div>
          <div className="bg-[#523f4a] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-[#febae1]">Power Ups</h3>
            <p>
              Grab power-ups to eat your enemies and dominate the leaderboard.
            </p>
          </div>
          <div className="bg-[#543b13] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-[#ffb749]">Skill-Based</h3>
            <p>
              Master the controls and outmaneuver your opponents to secure the
              pot.
            </p>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-16 bg-gray-700">
        <div className="max-w-xl mx-auto">
          <div className="bg-gray-400 p-6 rounded-lg shadow-md">
            <h1
              className="text-xl font-bold cursor-pointer flex justify-between items-center"
              onClick={() => setIsOpen(!isOpen)}
            >
              How to Play
              <span
                className={`transition-transform transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </h1>
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                isOpen ? "max-h-screen" : "max-h-0"
              }`}
            >
              <p className="text-lg mt-4">
                To start, join a room and add in $10.00 USD to play a game. You
                will spawn as a Pacman, control using your keyboard arrow keys,
                and eat the dots for money. If you manage to eat a large dot,
                you can eat other players to try to take their coins. If you
                win, you'll receive the entire game winnings pot.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
