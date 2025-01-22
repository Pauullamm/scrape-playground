import React, { useState } from 'react';
import { Send, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import '../App.css'

export default function ApiTestPage({ state, setState}) {
    const [url, setUrl] = useState(state.url ? state.url : '');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState(state.headers ? state.headers : [{ key: '', value: '' }]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showHeaders, setShowHeaders] = useState(true);
    const [showBody, setShowBody] = useState(true);
    const [rawHeadersInput, setRawHeadersInput] = useState(''); // Raw headers input
    const [useRawHeaders, setUseRawHeaders] = useState(false); // Toggle between raw and key-value inputs

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '' }]);
    };

    const removeHeader = (index) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const updateHeader = (index, field, value) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const headerObject = headers.reduce((acc, header) => {
                if (header.key && header.value) {
                    acc[header.key] = header.value;
                }
                return acc;
            }, {});

            const options = {
                method,
                headers: headerObject,
            };

            if (method !== 'GET' && body) {
                options.body = body;
            }
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const res = await fetch(proxyUrl + url, options);
            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.statusText}`);
            }

            const contentType = res.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                // If it's JSON, parse the response
                const data = await res.json();
                console.log(data);
                setResponse({
                    status: res.status,
                    statusText: res.statusText,
                    headers: Object.fromEntries(res.headers),
                    data,
                });
            } else {
                // If the response is not JSON, print the response text for debugging
                const data = await res.text();
                console.log('Non-JSON response:', data);
                setResponse({
                    status: res.status,
                    statusText: res.statusText,
                    headers: Object.fromEntries(res.headers),
                    data,
                });
            }
            
        } catch (error) {
            setResponse({
                error: error instanceof Error ? error.message : 'An error occurred',
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to parse raw headers input
    const parseRawHeaders = () => {
        try {
            // Remove curly braces and split into key-value pairs
            const cleanedInput = rawHeadersInput.replace(/[{}]/g, '').trim();
            if (!cleanedInput) {
                setHeaders([{ key: '', value: '' }]);
                return;
            }

            // Split into individual key-value pairs
            const pairs = cleanedInput.split(',').map(pair => pair.trim());

            // Parse each key-value pair
            const parsedHeaders = pairs.map(pair => {
                const [key, value] = pair.split(':').map(part => part.trim().replace(/['"]/g, ''));
                return { key, value };
            });

            // Update headers state
            setHeaders(parsedHeaders);
        } catch (error) {
            console.error('Error parsing headers:', error);
            alert('Invalid format. Please paste a valid Python dictionary.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
                {/* URL and Method Input */}
                <div className="flex gap-4">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {methods.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter API URL"
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send'}
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                {/* Headers Section */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowHeaders(!showHeaders)}
                    >
                        <h2 className="text-lg font-semibold">Headers</h2>
                        {showHeaders ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {showHeaders && (
                        <div className="mt-4 space-y-4">
                            {/* Toggle Switch */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Use Raw Headers</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={useRawHeaders}
                                        onChange={() => setUseRawHeaders(!useRawHeaders)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {/* Raw Headers Input */}
                            {useRawHeaders && (
                                <>
                                    <textarea
                                        value={rawHeadersInput}
                                        onChange={(e) => setRawHeadersInput(e.target.value)}
                                        placeholder="Paste Python dictionary here (e.g., {'key1': 'value1', 'key2': 'value2'})"
                                        className="w-full h-24 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                    <button
                                        onClick={parseRawHeaders}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Parse Headers
                                    </button>
                                </>
                            )}

                            {/* Key-Value Inputs */}
                            {!useRawHeaders && (
                                <>
                                    {headers.map((header, index) => (
                                        <div key={index} className="flex gap-4 w-full">
                                            <input
                                                type="text"
                                                value={header.key}
                                                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                                placeholder="Header Key"
                                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
                                            />
                                            <input
                                                type="text"
                                                value={header.value}
                                                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                                placeholder="Header Value"
                                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
                                            />
                                            <button
                                                onClick={() => removeHeader(index)}
                                                className="p-2 hover:bg-gray-600 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addHeader}
                                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                    >
                                        <Plus className="w-4 h-4" /> Add Header
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Body Section */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowBody(!showBody)}
                    >
                        <h2 className="text-lg font-semibold">Body</h2>
                        {showBody ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {showBody && (
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Enter request body (JSON)"
                            className="mt-4 w-full h-48 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        />
                    )}
                </div>

                {/* Response Section */}
                {response && (
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4">Response</h2>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            {response.error ? (
                                <div className="text-red-400">{response.error}</div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold">Status:</span>
                                        <span className={`px-2 py-1 rounded ${response.status >= 200 && response.status < 300
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {response.status} {response.statusText} 
                                        </span>
                                        
                                    </div>
                                    <pre className="whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                                        <span >
                                            {JSON.stringify(response.data, null, 2)}
                                        </span>
                                    </pre>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}