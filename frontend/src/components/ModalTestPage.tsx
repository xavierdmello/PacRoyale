import React, { useState } from "react";
import GameEndModal from "./GameEndModal";

const ModalTestPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  const handleWin = () => {
    setIsWinner(true);
    setShowModal(true);
  };

  const handleLose = () => {
    setIsWinner(false);
    setShowModal(true);
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-8">
      <div className="flex gap-4">
        <button
          onClick={handleWin}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xl transition-colors"
        >
          Test Win
        </button>
        <button
          onClick={handleLose}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xl transition-colors"
        >
          Test Lose
        </button>
      </div>

      <GameEndModal
        isOpen={showModal}
        isWinner={isWinner}
        tokenAmount={isWinner ? 1000 : 100}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ModalTestPage; 