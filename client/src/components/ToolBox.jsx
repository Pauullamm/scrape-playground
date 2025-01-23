import React, { useState, useEffect } from 'react';
import { MessageSquare, Play, Code2, Network, X } from 'lucide-react';

// Tab components
import RequestCapture from './RequestCapture';
import BrowserAutomation from './BrowserAutomation';
import ApiTestPage from './ApiTestPage';
import Chat from './Chat';

const tabs = [
  { id: 'requests', label: 'Background Request Capture', icon: Network },
  { id: 'api', label: 'API Testing', icon: Play },
  { id: 'automation', label: 'Browser Automation', icon: Code2 },
];

export default function ToolBox() {
  const [activeTab, setActiveTab] = useState('requests');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
        {
          message: "Hi! I'm your AI assistant. How can I help you with your testing today?",
          direction: 'incoming',
          position: 'single',
        },
      ];
  });

  // State for each tab
  const [requestsState, setRequestsState] = useState({
    url: "",
    resources: []
  });
  const [apiState, setApiState] = useState({});
  const [automationState, setAutomationState] = useState({});
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

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
          </div>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex min-h-0">
        {/* Editor Area */}
        <div className="flex-1 min-h-0">
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

        {/* Chat Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 w-96 bg-[#212121] border-l border-[#2A2A2A] transform transition-transform duration-300 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Chat Header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-[#2A2A2A]">
            <div className="flex items-center space-x-2">
              <MessageSquare size={18} />
              <span className="font-medium">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
            <Chat messages={messages} setMessages={setMessages} />
          </div>
        </div>
      </main>
    </div>
  );
}