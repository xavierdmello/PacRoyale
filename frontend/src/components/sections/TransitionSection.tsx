import React from "react";

export const TransitionSection: React.FC = () => {
  return (
    <div className="relative h-[300px] -mt-32 z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-[#030303]" />
    </div>
  );
}; 