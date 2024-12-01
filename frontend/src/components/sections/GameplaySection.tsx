import React from "react";
import { motion } from "framer-motion";
import { FaGamepad, FaBolt, FaCrown } from 'react-icons/fa';

interface GameplaySectionProps {
  mousePos: { x: number; y: number };
}

const GAMEPLAY_FEATURES = [
  {
    title: "BATTLE ROYALE",
    description: "Compete in intense multiplayer matches where only the strongest survive",
    icon: FaGamepad,
    delay: 0.2
  },
  {
    title: "POWER UPS",
    description: "Collect unique abilities and strategic advantages to dominate the arena",
    icon: FaBolt,
    delay: 0.4
  },
  {
    title: "RANKED MATCHES",
    description: "Rise through the ranks and become the ultimate champion",
    icon: FaCrown,
    delay: 0.6
  }
];

export const GameplaySection: React.FC<GameplaySectionProps> = ({ mousePos }) => {
  return (
    <div className="snap-start h-screen w-full shrink-0 relative bg-[#030303] overflow-hidden">
      {/* Background hex grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path 
              d="M25 0L50 14.4v28.8L25 57.7L0 43.3V14.5z" 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-9xl font-black tracking-tighter text-white/90">
            GAMEPLAY
          </h2>
          <motion.div
            className="h-px w-32 mx-auto mt-6"
            style={{
              background: "#fdfc02"
            }}
            initial={{ width: 0 }}
            whileInView={{ width: "8rem" }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          {GAMEPLAY_FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
            >
              {/* Card */}
              <motion.div
                className="relative bg-black/40 backdrop-blur-sm p-8 h-full overflow-hidden"
                whileHover={{ scale: 1.02 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`
                }}
              >
                {/* Glitch effect border */}
                <motion.div
                  className="absolute inset-0 border border-[#fdfc02]/20"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute inset-0 border border-[#fdfc02]/10"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1.02, 1, 1.02],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5
                  }}
                />

                {/* Icon with circuit pattern background */}
                <div className="relative mb-6">
                  <motion.div
                    className="w-16 h-16 relative z-10 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <feature.icon className="w-8 h-8 text-[#fdfc02]" />
                    
                    {/* Circuit lines */}
                    <motion.div
                      className="absolute top-full left-1/2 w-px h-12 bg-gradient-to-b from-[#fdfc02]/20 to-transparent"
                      animate={{
                        scaleY: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.2
                      }}
                    />
                    <motion.div
                      className="absolute left-full top-1/2 h-px w-12 bg-gradient-to-r from-[#fdfc02]/20 to-transparent"
                      animate={{
                        scaleX: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.2 + 0.2
                      }}
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <motion.h3 
                  className="text-3xl font-bold mb-4 text-white tracking-tight"
                  animate={{
                    textShadow: [
                      "0 0 8px rgba(253, 252, 2, 0)",
                      "0 0 8px rgba(253, 252, 2, 0.3)",
                      "0 0 8px rgba(253, 252, 2, 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.2
                  }}
                >
                  {feature.title}
                </motion.h3>
                <p className="text-white/60 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover reveal effect */}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-[#fdfc02]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />

                {/* Animated corner accents */}
                {[0, 90, 180, 270].map((rotation, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8"
                    style={{
                      top: i < 2 ? -1 : 'auto',
                      bottom: i >= 2 ? -1 : 'auto',
                      left: i % 3 === 0 ? -1 : 'auto',
                      right: i % 3 === 1 ? -1 : 'auto',
                      borderTop: i < 2 ? '2px solid #fdfc02' : 'none',
                      borderBottom: i >= 2 ? '2px solid #fdfc02' : 'none',
                      borderLeft: i % 3 === 0 ? '2px solid #fdfc02' : 'none',
                      borderRight: i % 3 === 1 ? '2px solid #fdfc02' : 'none',
                      opacity: 0.3
                    }}
                    animate={{
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 