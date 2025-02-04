import React from "react";
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                {/* Welcome Section */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
                        Welcome to Terrier!
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Your powerful companion for web data extraction
                    </p>
                </div>

                {/* Getting Started Section */}
                <div className="mb-20 text-left">
                    <h2 className="text-3xl font-bold mb-8 text-amber-400">
                        Getting Started
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">1. Obtain API Keys</h3>
                            <p className="text-gray-300 mb-4">
                                Terrier supports the following providers:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-300">
                                <li>OpenAI - Create keys in your <a href="https://platform.openai.com/api-keys" 
                                    className="text-amber-400 hover:underline" target="_blank">API settings</a></li>
                                <li>DeepSeek - Get keys from your <a href="https://platform.deepseek.com/api-keys" 
                                    className="text-orange-400 hover:underline" target="_blank">account dashboard</a></li>
                                <li>Gemini - Get a Gemini API key from <a href="https://ai.google.dev/gemini-api/docs/api-key" 
                                    className="text-orange-400 hover:underline" target="_blank">Google</a></li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">2. Configure Your Keys</h3>
                            <p className="text-gray-300">
                                Add your API keys in the <span className="text-amber-400">Settings page </span> 
                                to unlock Terrier's full capabilities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tools Page CTA */}
                <div className="mt-12">
                    <h3 className="text-2xl text-gray-300 mb-6">
                        Want to see Terrier in action?
                    </h3>
                    <button 
                        onClick={() => navigate('/tools')}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg 
                        hover:opacity-90 transition-opacity font-semibold flex items-center mx-auto"
                    >
                        Explore Tools Page
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}