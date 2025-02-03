import React, { useState } from 'react';

export default function HTMLParser2({ state, setState }) {
    const [url, setUrl] = useState(state.url || '');
    const [llmOutput, setLlmOutput] = useState(state.llmOutput || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const BACKEND_URL = "http://127.0.0.1:5000";

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BACKEND_URL}/foreground_parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: url }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            let parsedOutput;
            
            try {
                parsedOutput = JSON.parse(data.llm_output);
            } catch (parseError) {
                // If not valid JSON, keep as raw string
                parsedOutput = data.llm_output;
            }

            setLlmOutput(parsedOutput);
            setState({
                url: url,
                llmOutput: parsedOutput
            });

        } catch (error) {
            console.error('Error processing request:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderOutput = () => {
        if (!llmOutput) return null;
        
        if (typeof llmOutput === 'object') {
            return (
                <pre className="text-sm text-gray-300 overflow-auto">
                    <code>{JSON.stringify(llmOutput, null, 2)}</code>
                </pre>
            );
        }
        
        return (
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {llmOutput}
            </pre>
        );
    };

    return (
        <div className="h-full p-6">
            <div className="flex flex-col h-full">
                <p className="mb-2 text-gray-400 text-white text-base">
                    Retrieve structured content from the website's DOM
                </p>
                <p className="text-gray-400 text-sm mb-2">
                    This will analyze the webpage and extract structured data from its content
                </p>

                <div className="mb-4">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste URL to analyze"
                            className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="ml-2 bg-[#2A2A2A] text-gray-300 px-4 py-2 rounded-lg hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Analyzing...
                                </div>
                            ) : (
                                'Analyze'
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Display */}
                <div className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4 overflow-y-auto">
                    {error ? (
                        <div className="text-red-400 text-sm">
                            Error: {error}
                        </div>
                    ) : llmOutput ? (
                        renderOutput()
                    ) : (
                        <div className="text-gray-400 text-sm">
                            {loading ? 'Analyzing website...' : 'No analysis results yet'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}