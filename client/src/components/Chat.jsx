import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function Chat({ messages, setMessages }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      message: newMessage,
      direction: 'outgoing',
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        message: "I'm analyzing your request. How can I assist you further?",
        direction: 'incoming',
        position: 'single',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.direction === 'outgoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2A2A2A] text-gray-200'
              }`}
            >
              {message.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-[#2A2A2A] p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#1A1A1A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}