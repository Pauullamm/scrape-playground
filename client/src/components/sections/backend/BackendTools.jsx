// BackendTools.jsx
import { useState } from 'react';
import { Network, FlaskConical } from 'lucide-react';
import RequestCapture from '../../tools/backend/RequestCapture';
import ApiTestPage from '../../tools/backend/ApiTestPage';

const tabs = [
  { id: 'requests', label: 'Request Capture', icon: Network },
  { id: 'api', label: 'API Testing', icon: FlaskConical },
];

export default function BackendTools({ className }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requestsState, setRequestsState] = useState({ url: "", resources: [] });
  const [apiState, setApiState] = useState({});

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'requests': return <RequestCapture state={requestsState} setState={setRequestsState} />;
      case 'api': return <ApiTestPage state={apiState} setState={setApiState} />;
      default: return null;
    }
  };

  return (
    <div className={`h-screen bg-[#1A1A2A] text-white flex flex-col ${className} mt-20 mb-20 backdrop-blur-sm rounded-lg`}>
      <header className="h-18 border-b border-blue-800 p-4">
        <div className="flex items-center gap-1">
          <h1 className="lg:text-xl font-bold">Backend Tools</h1>
          <div className="w-1 h-6 bg-blue-600 mx-2" />
          <h2 className="text-sm">Network monitoring & API testing</h2>
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
                      ? 'bg-blue-900/50 text-white'
                      : 'bg-[#1A1A2A] text-gray-400 hover:bg-blue-900/30'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="bg-blue-900/20 h-full rounded-lg border border-blue-800/50 overflow-hidden">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}