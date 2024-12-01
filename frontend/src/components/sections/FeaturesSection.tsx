import React from "react";
import { motion } from "framer-motion";
import { FaGamepad, FaBolt, FaTrophy } from 'react-icons/fa';

interface FeaturesSectionProps {
  mousePos: { x: number; y: number };
}

const FEATURES = [
  {
    icon: FaGamepad,
    title: "Competitive Play",
    description: "Join rooms, compete against others, and claim victory to win real rewards.",
    color: "#fdfc02",
    delay: 0,
  },
  {
    icon: FaBolt,
    title: "Power Ups",
    description: "Grab power-ups to eat your enemies and dominate the leaderboard.",
    color: "#fdfc02",
    delay: 0.1,
  },
  {
    icon: FaTrophy,
    title: "Skill-Based Domination",
    description: "Master the controls, outmaneuver your opponents, and prove you're the ultimate champion.",
    color: "#fdfc02",
    delay: 0.2,
    isHighlight: true,
  },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ mousePos }) => {
  return (
    <>
      {/* Title Section */}
      <div className="snap-start h-screen w-full shrink-0 bg-[#030303]">
        <div className="relative h-full flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative inline-block"
            >
              <span className="text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent">
                FEATURES
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      {FEATURES.map((feature, index) => (
        <div key={index} className="snap-start h-screen w-full shrink-0 bg-[#030303]">
          <div className="relative h-full flex items-center">
            <div className="max-w-[1800px] mx-auto px-6 w-full">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: feature.delay }}
              >
                <div className="relative max-w-[1600px] mx-auto">
                  <div className={`flex items-center gap-24 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    {/* Feature Content */}
                    <div className="w-[55%]">
                      <div className="relative">
                        <motion.div
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="absolute -left-6 top-1/2 h-px bg-gradient-to-r from-transparent via-[#fdfc02] to-transparent"
                        />
                        <h3 className={`text-6xl font-black tracking-tighter mb-8 ${feature.isHighlight ? 'bg-gradient-to-r from-white via-[#fdfc02] to-white bg-clip-text text-transparent' : ''}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-2xl ${feature.isHighlight ? 'text-white/80' : 'text-white/60'} leading-relaxed`}>
                          {feature.description}
                        </p>
                        {feature.isHighlight && (
                          <div className="absolute -inset-4 -z-10 bg-[#fdfc02] opacity-[0.02] blur-3xl rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* Feature Visual */}
                    <div className="relative w-[45%] h-[600px] perspective-[2000px]">
                      {/* Main 3D Container */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          transform: `rotate3d(${mousePos.y * 0.1}, ${mousePos.x * 0.1}, 0, ${Math.sqrt(Math.pow(mousePos.x, 2) + Math.pow(mousePos.y, 2)) * 3}deg)`,
                          transition: 'transform 0.2s ease-out',
                        }}
                      >
                        {/* 3D Tunnel Effect */}
                        <div className="absolute inset-0">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={{
                                width: `${100 + i * 40}%`,
                                height: `${100 + i * 40}%`,
                                background: `radial-gradient(circle at center, rgba(253, 252, 2, ${0.03 - (i * 0.002)}) 0%, transparent 60%)`,
                                transform: `translate(-50%, -50%) translateZ(${-i * 80}px)`,
                                borderRadius: '50%',
                              }}
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 20 + i * 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ))}
                        </div>

                        {/* Floating Particles */}
                        {[...Array(30)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-1 h-1 bg-[#fdfc02]"
                            style={{
                              opacity: 0.2,
                            }}
                            animate={{
                              scale: [1, 0.5, 1],
                              z: [-300, 100],
                              x: [Math.random() * 300 - 150, Math.random() * 300 - 150],
                              y: [Math.random() * 300 - 150, Math.random() * 300 - 150],
                            }}
                            transition={{
                              duration: 4 + Math.random() * 4,
                              repeat: Infinity,
                              ease: "linear",
                              delay: Math.random() * -10,
                            }}
                          />
                        ))}

                        {/* Energy Field Effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="relative w-96 h-96"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute inset-0"
                                style={{
                                  background: `radial-gradient(circle at center, rgba(253, 252, 2, ${0.05 - (i * 0.01)}) 0%, transparent ${40 + i * 20}%)`,
                                  transform: `scale(${1 + i * 0.2})`,
                                }}
                                animate={{
                                  scale: [1 + i * 0.2, 1 + i * 0.3, 1 + i * 0.2],
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  scale: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  },
                                  rotate: {
                                    duration: 15 + i * 5,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>

                        {/* Feature Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {/* Glow Effect */}
                            <div className="absolute -inset-6 bg-[#fdfc02] opacity-[0.1] blur-2xl rounded-full" />
                            <feature.icon className="relative w-32 h-32 text-[#fdfc02] opacity-80" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}; 