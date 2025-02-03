// FrontendTools.jsx
import { useState } from 'react';
import { Code2, LayoutTemplate } from 'lucide-react';
import BrowserAutomation from '../../tools/frontend/BrowserAutomation';
import HTMLParser2 from '../../tools/frontend/HTMLParser2';

const tabs = [
  { id: 'parser', label: 'HTML Parser', icon: LayoutTemplate },
  { id: 'automation', label: 'Browser Automation', icon: Code2 },
];

export default function FrontendTools({ className }) {
  const [activeTab, setActiveTab] = useState('parser');
  const [automationState, setAutomationState] = useState({});
  const [parserState, setParserState] = useState({});

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'parser': return <HTMLParser2 state={parserState} setState={setParserState} />;
      case 'automation': return <BrowserAutomation state={automationState} setState={setAutomationState} />;
      default: return null;
    }
  };

  return (
    <div className={`h-screen bg-[#1A2A1A] text-white flex flex-col ${className} mt-20 mb-20 backdrop-blur-sm rounded-lg`}>
      <header className="h-18 border-b border-green-800 p-4">
        <div className="flex items-center gap-1">
          <h1 className="lg:text-xl font-bold">Frontend Tools</h1>
          <div className="w-1 h-6 bg-green-600 mx-2" />
          <h2 className="text-sm">Browser automation & HTML analysis</h2>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">
        <div className="flex-1 min-h-0 min-w-0">
          <div className="h-full p-4 flex flex-col">
            <div className="flex space-x-2 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-900/50 text-white'
                      : 'bg-[#1A2A1A] text-gray-400 hover:bg-green-900/30'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="bg-green-900/20 h-full rounded-lg border border-green-800/50 overflow-hidden">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}