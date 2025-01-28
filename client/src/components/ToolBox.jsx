import BackendTools from './sections/backend/BackendTools';
import FrontendTools from './sections/frontend/FrontendTools';
import bg from '../assets/bg.jpeg';
import '../App.css'

export default function ToolBox() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <img
        src={bg}
        className="fixed opacity-70 w-full h-full"
        alt="Background"
      />

      {/* Introduction Section */}
      <div className='relative z-10'>
        <div className="max-w-7xl mx-auto px-4 py-6 w-full">
          <p className="text-gray-200 rounded-lg backdrop-blur-sm mt-40 mb-20 ml-2">
            Explore different tools to help with your scraping process.
            <br></br>
            Scroll down to access all available utilities.
          </p>
        </div>

        {/* Tools Container */}
        <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 w-full gap-8 pb-24">
          <BackendTools />
          <FrontendTools />
        </div>

        {/* Footer */}
        <footer className="bg-[#2A2A2A] py-4 mt-auto bottom-0 w-full">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>Terrier AI | Open Source Project | v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}