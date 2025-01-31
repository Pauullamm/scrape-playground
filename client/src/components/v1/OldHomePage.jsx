import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatContainer, MessageList, Message, MessageInput, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';

export default function HomePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);  // State to toggle preview
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState(() => {
        // Load messages from localStorage on component mount
        const savedMessages = localStorage.getItem('chatHistory');
        return savedMessages ? JSON.parse(savedMessages) : [{
            props: {
                model: {
                    message: "Hi how can I help with your url request today?",
                    direction: 'incoming',
                    position: 'single',
                }
            }
        }];
    });

    const keys = useSelector((state) => state.settings);
    const API_KEY = keys.openaiKey;
    const BACKEND_URL = "http://127.0.0.1:5000"

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowPreview(true);
        }, 1000);
    };

    const processMessageToAgent = async (message) => {

        try {
            // Send the request to your backend
            const response = await fetch(`${BACKEND_URL}/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`, // If API_KEY is needed for authentication
                },
                body: JSON.stringify({
                    "message": message + "\n" + url,
                }),
            });

            if (!response.ok) {
                setIsTyping(false);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the response data from your backend
            const data = await response.json();
            setIsTyping(false);
            if (data) { // Assuming the backend returns a queryResult from the agent
                // Set the response from the agent (query result)
                const dataToRender = data.slice(2);
                console.log(dataToRender)
                const newMessages = dataToRender.map((message) => ({
                    props: {
                        model: {
                            message: message.content,
                            direction: 'incoming',
                            position: 'single',
                        },
                    },
                }));

                setMessages((prevMessages) => [...prevMessages, ...newMessages])
            } else {
                console.error("Invalid response format from backend:", data);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    };

    const handleSendMessage = async (message) => {
        const newMessage = {
            props: {
                model: {
                    message: message,
                    direction: 'outgoing',
                    sender: 'user',
                }
            }
        }
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsTyping(true);
        await processMessageToAgent(message);
    };

    const clearChatHistory = () => {
        const confirmClear = window.confirm('Are you sure you want to clear all chat history?');
        if (confirmClear) {
            setMessages([{
                props: {
                    model: {
                        message: "Hi how can I help with your url request today?",
                        direction: 'incoming',
                        position: 'single',
                    }
                }
            }]);
        }
    };

    const togglePreview = () => {
        setIsPreviewOpen((prevState) => !prevState);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter website URL to scrape..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Analyze'}
                    </button>
                </form>
            </div>

            {!showPreview && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <p className="text-xl">Enter a URL above to start analyzing the website</p>
                </div>
            )}

            {showPreview && (
                <div className="bg-gray-800 rounded-lg p-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Website Preview</h2>
                        <button
                            onClick={togglePreview}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700"
                        >
                            {isPreviewOpen ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                            {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
                        </button>
                    </div>

                    {isPreviewOpen && (
                        <div className="space-y-4">
                            <div className="bg-gray-800 rounded-lg p-4 mt-6">
                                <iframe
                                    id="website-iframe"
                                    src={url}
                                    className="w-full h-96 border-0"
                                    title="Website Preview"
                                    sandbox="allow-same-origin allow-scripts"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            {showPreview && (
                <div className="bg-gray-800 rounded-lg p-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Chat Session</h2>
                        <button
                            onClick={clearChatHistory}
                            className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear History
                        </button>
                    </div>
                    <div className="space-y-4">
                        <ChatContainer>
                            <MessageList
                                typingIndicator={isTyping ? <TypingIndicator />: null}
                                className="bg-gray-900 p-4 rounded-lg h-64 overflow-y-auto"
                            >
                                {messages.map((m, i) =>
                                    m.type === "separator" ? (
                                        <MessageSeparator key={i} {...m.props} />
                                    ) : (
                                        <Message
                                            key={i}
                                            {...m.props}
                                            className={`bg-gray-800 p-3 rounded-lg mb-4 last:mb-0 max-w-max ${m.props.model.sender === "user" ? "ml-auto text-right" : "mr-auto text-left"
                                                }`}
                                        />
                                    )
                                )}
                            </MessageList>
                        </ChatContainer>

                            <MessageInput
                                attachButton={false}
                                placeholder={"Type your message..."}
                                className="bg-gray-700 p-4 border-1 rounded-lg mt-6 focus:outline-none focus:border-blue-500"
                                onSend={handleSendMessage}
                                r
                                style={{'color': '#aaa'}}
                            />

                    </div>
                </div>
            )}
        </main>
    );
}