import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Wifi, WifiOff } from 'lucide-react'

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

  const connectWebSocket = () => {
    // Close existing connection if it exists
    if (ws.current) {
      ws.current.close();
    }

    // Connect to WebSocket
    ws.current = new WebSocket('ws://127.0.0.1:5000/ws');

    ws.current.onopen = () => {
      setStatus('Connected - Ready for commands');
      setError(null);
    };

    ws.current.onmessage = (event) => {
      try {
        if (event.data instanceof Blob) {
          // Handle binary data (e.g., image or GIF)
          const blob = event.data;
          const url = URL.createObjectURL(blob);

          // Determine the type based on the content (if possible)
          const type = blob.type.startsWith('image/gif') ? 'gif' : 'image';

          setHistory(prev => [...prev, {
            type: type, // 'image' or 'gif'
            content: url, // Blob URL
            timestamp: new Date().toISOString()
          }]);
          scrollToBottom();
        } else {
          // Handle text messages
          const message = event.data;
          setHistory(prev => [...prev, {
            type: 'message',
            content: message,
            timestamp: new Date().toISOString()
          }]);
          scrollToBottom();
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
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      setStatus('Connection closed');
      setError('Disconnected from server');
    }
  };

  useEffect(() => {
    // Connect to WebSocket when component mounts
    connectWebSocket();

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
          <div className="flex items-center gap-2">
            <p className="text-gray-400">{status}</p>
            {ws.current && ws.current.readyState === WebSocket.OPEN ? (
              <button
                onClick={disconnectWebSocket}
                className=" flex opacity-70 bg-red-600 hover:bg-red-700 px-4 py-2 gap-2 rounded-lg text-white transition-colors"
              >
                <p>Disconnect</p>
                <WifiOff />
              </button>
            ) : (
              <button
                onClick={connectWebSocket}
                placeholder="Connect"
                className="flex opacity-90 bg-green-700 hover:bg-green-500 px-4 py-2 gap-2 rounded-lg text-white transition-colors"
              >
                <p>Connect</p>
                <Wifi style={{ "margin-left": "calc(var(--spacing) * 1" }} />
              </button>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <div className="text-sm space-y-3">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${entry.type === 'error' ? 'bg-red-900/20 border border-red-800/50' :
                    entry.type === 'result' ? (entry.success ? 'bg-green-900/20' : 'bg-yellow-900/20') :
                      'bg-[#2A2A2A]'
                    }`}
                >
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span className="uppercase">{entry.type}</span>
                  </div>
                  {entry.type === 'gif' ? (
                    <div className='flex justify-center'>
                      <img src={entry.content} alt="GIF" className="w-3/4" />
                    </div>
                  ) : entry.type === 'image' ? (
                    <div className='flex justify-center'>
                      <img src={entry.content} alt="Image" className="w-3/4" />
                    </div>
                  ) : (
                    <div className="text-gray-100 font-mono break-words whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  )}
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <textarea
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onSubmit={sendPrompt}
            style={{
              resize: 'none'
            }}
            placeholder='Enter instructions for AI browser agent'
            className="flex-1 bg-[#2A2A2A] text-sm align-middle placeholder-opacity-50 rounded-lg px-4 py-2 text-gray-100 focus:outline-none"
          />
          <div className='flex items-center'>
            <button
              onClick={sendPrompt}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-white transition-colors disabled:opacity-50"
              disabled={!prompt.trim()}
            >
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}