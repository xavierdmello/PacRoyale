import React from "react";
import LogoHeader from "../assets/HeaderLogo.png";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#080707] w-full border-b-2 border-gray-700 h-20">
      <div className="flex items-center h-full">
        {/* Logo on the left */}
        <div className="flex items-center ml-20">
          <img src={LogoHeader} alt="Logo" className="h-8 w-auto" />
        </div>
        {/* Pacman dots filling the remainder */}
        <div className="flex-grow flex items-center justify-center">
          <div className="flex gap-2 mr-4">
            {Array.from({ length: 78 }).map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 bg-white rounded-full"
                style={{ animation: `fadeIn 2s ${index * 0.1}s infinite` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
