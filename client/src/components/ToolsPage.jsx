import FrontendTools from './FrontendTools';
import { useState } from 'react';
import { BsGithub } from "react-icons/bs";
import '../App.css';
import HTMLParser2 from './HTMLParser2';

export default function ToolsPage() {
  const [parserState, setParserState] = useState({});
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Tools Container */}
      <div className="flex-1 flex flex-col max-w-7xl mt-36 mx-auto px-4 w-full gap-8 pb-24">
        <HTMLParser2 state={parserState} setState={setParserState} />
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 py-4 mt-auto bottom-0 w-full">
        <div className="flex flex-col max-w-7xl mx-auto px-4 text-center items-center text-gray-700">
          <a className="flex gap-2 items-center" href="https://github.com/Pauullamm/scrape-playground">
            <p>Terrier AI</p>
            <BsGithub className="mt-1" />
          </a>
          <p>Open Source Project | v0.0.0</p>
        </div>
      </footer>
    </div>
  );
}
