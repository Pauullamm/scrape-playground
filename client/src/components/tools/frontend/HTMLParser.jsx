import React, { useState } from 'react';
import DataRow from './DataRow';

export default function HTMLParser({ state, setState }) {
    const [url, setUrl] = useState(state.url ? state.url : '');
    const [resources, setResources] = useState(state.resources ? state.resources : []);
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(false)
    const [resourceError, setResourceError] = useState('');

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://${BACKEND_URL}/foreground_parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: url,
                }),
            });

            if (!response.ok) {
                setResourceError(response.status);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data) {
                console.log(data)
                setResources(data);
                setState({
                    url: url,
                    resources: data
                })
                setLoading(false);
            } else {
                console.error('Invalid response format from backend:', data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            setLoading(false);
        }
    };

    return (
        <div className="h-full p-6">
            <div className="flex flex-col h-full">
                <p className="mb-2 text-gray-400 text-white text-base">Retrieve JSON-like content from the website's DOM</p>
                <p className="text-gray-400 text-sm mb-2">This will retrieve the frontend HTML content and parse it to look for JSON-like content loaded in its scripts</p>

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

                {/* Results Table */}
                <div className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4 overflow-y-auto">
                    {resources.length > 0 ? (
                        <table className="w-full text-sm text-gray-300">
                            <thead>
                                <tr className="border-b border-[#2A2A2A]">
                                    <th className="p-2 text-left"># of child nodes</th>
                                    <th className="p-2 text-left">node content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map((node, index) => (
                                    <DataRow
                                        key={index}
                                        node={node}
                                        index={index}
                                        expandedRow={expandedRow}
                                        setExpandedRow={setExpandedRow}
                                    />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <pre className="text-sm text-gray-300">
                            {resourceError ? <code>// Server Error</code> : <code>// No requests found</code>}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}