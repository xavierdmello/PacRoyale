import React, { useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

interface HeroSectionProps {
  mousePos: { x: number; y: number };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ mousePos }) => {
  const particlesInit = useCallback(async (main: any) => {
    await loadFull(main);
  }, []);

  return (
    <div className="relative h-screen snap-start">
      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          particles: {
            color: { value: "#fdfc02" },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: true,
              speed: 0.8,
              straight: false,
              attract: { enable: true, rotateX: 600, rotateY: 1200 }
            },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: {
              value: 0.5,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1 }
            },
            shape: { type: "circle" },
            size: {
              value: { min: 1, max: 3 },
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1 }
            }
          }
        }}
        className="absolute inset-0"
      />

      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fdfc0215 1px, transparent 1px),
            linear-gradient(to bottom, #fdfc0215 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `rotate(${mousePos.x * 2}deg)`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          overflow: 'hidden'
        }}
      />

      {/* Radial Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${50 + mousePos.x * 20}% ${50 + mousePos.y * 20}%, transparent 0%, rgba(0,0,0,0.8) 70%)`
        }}
      />

      {/* Glowing Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at center, ${['#fdfc02', '#ff4e00', '#00ff00'][i % 3]}22 0%, transparent 70%)`,
            filter: 'blur(20px)',
            top: `${20 + i * 15}%`,
            left: `${20 + i * 15}%`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-12"
        >
          {/* Main Title */}
          <motion.div className="relative">
            <h1 className="text-[12vw] leading-none font-black tracking-tighter mix-blend-difference">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-[#fdfc02] blur-[20px] opacity-40">PacRoyale</span>
                <span className="absolute inset-0 text-[#ff4e00] blur-md opacity-30">PacRoyale</span>
                <span className="absolute inset-0 text-[#fdfc02] blur-[1px] animate-pulse opacity-40">PacRoyale</span>
                <span className="relative text-white">PacRoyale</span>
              </span>
            </h1>
            <motion.div 
              className="absolute -inset-8 bg-gradient-to-r from-yellow-500/30 via-red-500/20 to-yellow-500/30 rounded-[30px] blur-2xl"
              animate={{
                scale: [0.8, 0.8, 0.8],
                opacity: [0.3, 0.7, 0.3],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-4xl font-light tracking-wide"
            style={{
              textShadow: '0 0 10px rgba(253, 252, 2, 0.5)',
            }}
          >
            EAT OR BE EATEN.
          </motion.p>

          {/* CTA Button */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg opacity-70 blur" />
            <div className="relative px-12 py-4 bg-black rounded-lg font-bold text-2xl">
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                START GAME
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 