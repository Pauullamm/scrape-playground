import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiDownloadCloud, FiAlertCircle, FiSearch } from 'react-icons/fi';


export default function HTMLParser2({ state, setState }) {
    // 1. State and hooks
    const [url, setUrl] = useState(state.url || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [llmOutput, setLlmOutput] = useState(state.llmOutput || null);
    const [callerOutput, setCallerOutput] = useState(state.callerOutput || null);
    const [isFocused, setIsFocused] = useState(false);
    const [execTime, setExecTime] = useState(null);

    // 2. Selectors and derived values
    const keys = useSelector((state) => state.settings);
    const API_KEY = keys.aiModel === 'gemini' ? keys.geminiKey : keys.openaiKey;
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // Event handlers and API calls
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);


    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        try {
            var startTime = new Date().getTime();
            const response = await fetch(`${BACKEND_URL}/foreground_parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({ message: url }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            // Process reader output
            let parsedReaderOutput;
            try {
                parsedReaderOutput = JSON.parse(data[0].llm_output);
            } catch (parseError) {
                parsedReaderOutput = data[0].llm_output;
            }

            // Process caller output
            const rawCallerOutput = data[1]?.caller_output || [];
            var endTime = new Date().getTime();

            // Update states
            setLlmOutput(parsedReaderOutput);
            setCallerOutput(rawCallerOutput);
            setState({
                url: url,
                llmOutput: parsedReaderOutput,
                callerOutput: rawCallerOutput
            });
            setExecTime(endTime - startTime);

        } catch (error) {
            console.error('Error processing request:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleDownload = () => {
        if (!callerOutput || callerOutput.length === 0) return;

        const jsonString = JSON.stringify(callerOutput, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caller_output_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderDownloadButton = () => {
        if (!callerOutput) return null;

        return (
            <button
                onClick={handleDownload}
                className="px-4 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
                <FiDownloadCloud />
                <span>Export Data</span>
            </button>
        );
    };

    const renderOutput = () => {
        if (!llmOutput) return null;

        if (typeof llmOutput === 'object') {
            return (
                <div className="space-y-4">
                    {Object.entries(llmOutput).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-300 pb-4">
                            <h3 className="font-medium text-gray-700 mb-2 capitalize">{key}</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(value, null, 2)}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="p-4 bg-white rounded-lg shadow-inner">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                    {llmOutput}
                </pre>
            </div>
        );
    };


    return (
        <div className="h-full p-4">
            <div className="flex flex-col h-full space-y-6">
                <div className="space-y-2">
                    <p className="text-gray-500 text-sm">
                        Enter a URL to extract structured content and semantic data
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-4">
                    <div className="flex gap-2 items-center relative border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="https://example.com"
                            className="flex-1 px-4 py-3 text-lg bg-transparent outline-none placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-6 w-6 text-current"
                                    viewBox="0 0 24 24"
                                >
                                    {/* Spinner SVG */}
                                </svg>
                            ) : (
                                <FiSearch className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <FiAlertCircle className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </form>

                <div className="flex-1 overflow-hidden">
                    {llmOutput ? (
                        <div className="h-full bg-white/30 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-4 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <div className='flex items-center'>
                                    <h3 className="font-semibold text-gray-700">Analysis Preview</h3>
                                    <p className='flex items-center justify-center mx-2 text-gray-400'>
                                        {execTime ? `${execTime / 1000} seconds` : ''}
                                    </p>
                                </div>
                                {renderDownloadButton()}
                            </div>
                            <div className="prose prose-sm max-w-none">
                                {renderOutput()}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            {loading ? 'Analyzing content...' : 'Analysis results will appear here'}

                        </div>

                    )}
                </div>
            </div>
        </div>
    );
}