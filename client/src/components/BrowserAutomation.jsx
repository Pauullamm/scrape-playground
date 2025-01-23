import React, { useState, useEffect, useRef } from 'react';

export default function BrowserAutomation() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Connecting...');
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const historyEndRef = useRef(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Connect to WebSocket when component mounts
    ws.current = new WebSocket('ws://127.0.0.1:5000/ws');

    ws.current.onopen = () => {
      setStatus('Connected - Ready for commands');
      setError(null);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;

        switch(message.type) {
          case 'step':
            setHistory(prev => [...prev, {
              type: 'step',
              content: `Step ${message.step}: ${message.action}`,
              timestamp: new Date().toISOString()
            }]);
            break;
            
          case 'result':
            setHistory(prev => [...prev, {
              type: 'result',
              content: message.data,
              success: message.success,
              timestamp: new Date().toISOString()
            }]);
            break;
            
          case 'error':
            setError(message.data);
            setHistory(prev => [...prev, {
              type: 'error',
              content: `Error: ${message.data}`,
              timestamp: new Date().toISOString()
            }]);
            break;
            
          case 'status':
            setStatus(message.data);
            break;
            
          default:
            setHistory(prev => [...prev, {
              type: 'message',
              content: typeof message === 'object' ? JSON.stringify(message, null, 2) : message,
              timestamp: new Date().toISOString()
            }]);
        }
        
        scrollToBottom();

      } catch (e) {
        console.error('Failed to parse message:', event.data);
        setHistory(prev => [...prev, {
          type: 'error',
          content: `Invalid message: ${event.data.substring(0, 50)}...`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    ws.current.onclose = () => {
      setStatus('Connection closed');
      setError('Disconnected from server');
    };

    ws.current.onerror = (error) => {
      setStatus('Connection error');
      setError(error.message || 'WebSocket error occurred');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendPrompt = () => {
    if (ws.current && prompt.trim()) {
      if (ws.current.readyState !== WebSocket.OPEN) {
        setError('Connection not ready');
        return;
      }
      
      setHistory([]);
      setError(null);
      ws.current.send(prompt);
      setPrompt('');
      setStatus('Processing...');
    }
  };
  
  return (
    <div className="h-full p-6">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Browser Automation</h2>
          <p className="text-gray-400">{status}</p>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        <div className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <div className="text-sm space-y-3">
              {history.map((entry, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    entry.type === 'error' ? 'bg-red-900/20 border border-red-800/50' :
                    entry.type === 'result' ? (entry.success ? 'bg-green-900/20' : 'bg-yellow-900/20') :
                    'bg-[#2A2A2A]'
                  }`}
                >
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span className="uppercase">{entry.type}</span>
                  </div>
                  <div className="text-gray-100 font-mono break-words whitespace-pre-wrap">
                    {entry.content}
                  </div>
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendPrompt()}
            placeholder="Enter command for AI agent..."
            className="flex-1 bg-[#2A2A2A] rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendPrompt}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
            disabled={!prompt.trim()}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}