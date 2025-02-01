import React from "react";
import StartingInput from '../StartingInput.jsx';
import Navbar from '../Navbar.jsx';
import hbg from '../../assets/hbg.png';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={hbg}
          className="w-full h-full object-cover"
          alt="Background"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
      </div>


      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-200 drop-shadow-lg">
          Welcome to Terrier AI
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mt-4">
          Enter a URL below to begin your web scraping process.
        </p>

        {/* Search Input Bar */}
        <div className="mt-6 w-full max-w-lg bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg">
          <StartingInput />
        </div>
      </div>
    </div>
  );
}
