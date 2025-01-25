import React, { useState } from 'react';
import { Code2, Network, FlaskConical } from 'lucide-react';

import RequestCapture from './RequestCapture';
import BrowserAutomation from './BrowserAutomation';
import ApiTestPage from './ApiTestPage';

const tabs = [
  { id: 'requests', label: 'Background Request Capture', icon: Network },
  { id: 'api', label: 'API Testing', icon: FlaskConical },
  { id: 'automation', label: 'Browser Automation', icon: Code2 },
];

export default function ToolBox() {
  const [activeTab, setActiveTab] = useState('requests');

  // State for each tab
  const [requestsState, setRequestsState] = useState({
    url: "",
    resources: []
  });
  const [apiState, setApiState] = useState({});
  const [automationState, setAutomationState] = useState({});

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'requests':
        return <RequestCapture state={requestsState} setState={setRequestsState} />;
      case 'api':
        return <ApiTestPage state={apiState} setState={setApiState} />;
      case 'automation':
        return <BrowserAutomation state={automationState} setState={setAutomationState} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-[#1A1A1A] text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#2A2A2A] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h1 className="text-3xl font-bold">Terrier</h1>
            <img
              src='white-dog-logo.png'
              style={{ height: '2em', width: '2em' }}
            />
            <h2 className="text-md italic">Your Web Scraping Companion</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 min-w-0">
        {/* Editor Area */}
        <div className="flex-1 min-h-0 min-w-0">
          <div className="h-full max-w-7xl mx-auto px-4 py-6 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-[#2A2A2A] text-white'
                      : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                    }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            <div className="bg-[#212121] h-full rounded-lg border border-[#2A2A2A] overflow-hidden">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}