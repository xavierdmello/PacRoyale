// src/components/LandingPage.tsx
import React from "react";
import Instructions from "./Instructions"; // Import the HowToPlay component

const LandingPage: React.FC = () => {
  return (
    <div className="bg-black text-white font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 min-h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-8 md:px-16 py-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to Pac Royale!
          </h1>
          <p className="text-lg md:text-xl mb-8">
            A thrilling game where you control Pacman and eat dots to collect
            coins. Can you become the ultimate Pacman champion?
          </p>
          <a
            href="#how-to-play"
            className="bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-6 rounded-lg text-xl font-semibold"
          >
            Start Playing
          </a>
        </div>
      </section>

      {/* Game Instructions */}
      <section id="how-to-play" className="mt-16 px-8 md:px-16 py-12 bg-gray-800 rounded-lg">
        <Instructions />
      </section>
    </div>
  );
};

export default LandingPage;
