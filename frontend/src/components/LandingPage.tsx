import React, { useState, useEffect } from "react";
import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { TransitionSection } from "./sections/TransitionSection";
import { GameplaySection } from "./sections/GameplaySection";

interface LandingPageProps {
  setPage: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setPage }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black text-white">
        <div className="h-full overflow-y-auto snap-y snap-mandatory">
          <div className="snap-start h-screen w-full shrink-0">
            <HeroSection mousePos={mousePos} setPage={setPage} />
          </div>
          <TransitionSection />
          <FeaturesSection mousePos={mousePos} />
          <TransitionSection />
          <GameplaySection mousePos={mousePos} />
        </div>
      </div>
    </>
  );
};

export default LandingPage;