import React from "react";

interface EndscreenProps {
  isActive: boolean;
  score: number;
  onRestart: () => void; // Callback to restart the game
}

const Endscreen: React.FC<EndscreenProps> = ({ isActive, score, onRestart }) => {
  if (!isActive) return null; // Do not render the component if inactive

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className="text-lg mb-6">Your Score: {score}</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onRestart}
        >
          Please Come Again!
        </button>
      </div>
    </div>
  );
};

export default Endscreen;