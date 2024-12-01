// src/components/Navbar.tsx
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-transparent border-b-2 border-white p-4">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src="/assets/HeaderLogo.png" alt="Logo" className="h-8" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
