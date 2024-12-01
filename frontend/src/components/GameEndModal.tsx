import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import { FaTrophy, FaSkull } from 'react-icons/fa';

interface GameEndModalProps {
  isOpen: boolean;
  isWinner: boolean;
  tokenAmount: number;
  onClose: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({ 
  isOpen, 
  isWinner, 
  tokenAmount,
  onClose 
}) => {
  // Using green-500 (#22c55e) - brighter than before
  const primaryColor = isWinner ? '#22c55e' : '#ff0000';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Confetti for winners - keeping bright colors */}
          {isWinner && <Confetti 
            recycle={false} 
            numberOfPieces={200}
            colors={['#00ff00', '#32CD32', '#00ff80']}
          />}

          {/* Overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 bg-[#030303] p-12 rounded-2xl max-w-lg w-full mx-4 border border-gray-800"
          >
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              {isWinner ? (
                <FaTrophy className="w-20 h-20 mx-auto text-green-500" />
              ) : (
                <FaSkull className="w-20 h-20 mx-auto text-red-500" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-black text-center mb-4"
              style={{ color: primaryColor }}
            >
              {isWinner ? "VICTORY!" : "DEFEAT"}
            </motion.h2>

            {/* Token Amount */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <p className="text-gray-400 mb-2">
                {isWinner ? "You won" : "You lost"}
              </p>
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                {tokenAmount} TOKENS
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.button
              onClick={onClose}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors ${
                isWinner 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isWinner ? "CLAIM REWARD" : "TRY AGAIN"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameEndModal; 