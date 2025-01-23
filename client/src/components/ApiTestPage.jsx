import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import '../App.css'

export default function ApiTestPage({ state, setState }) {
    const [url, setUrl] = useState(state.url ? state.url : '');
    const [method, setMethod] = useState('GET');
    const [activeTab, setActiveTab] = useState('params');
    const [params, setParams] = useState([{ key: '', value: '' }]);
    const [headers, setHeaders] = useState(state.headers ? state.headers : [{ key: '', value: '' }]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showBody, setShowBody] = useState(true);
    const [rawHeadersInput, setRawHeadersInput] = useState('');
    const [useRawHeaders, setUseRawHeaders] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    useEffect(() => {
        const parseUrlParams = () => {
            try {
                const urlObj = new URL(url);
                const params = Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({ key, value }));
                setParams(params.length > 0 ? params : [{ key: '', value: '' }]);
                setBaseUrl(urlObj.origin + urlObj.pathname);
            } catch (error) {
                setBaseUrl(url);
                setParams([{ key: '', value: '' }]);
            }
        };
        parseUrlParams();
    }, [url]);

    useEffect(() => {
        const constructUrl = () => {
            try {
                const urlObj = new URL(baseUrl);
                params.forEach(({ key, value }) => {
                    if (key) urlObj.searchParams.set(key, value);
                });
                setUrl(urlObj.toString());
            } catch (error) {
                const queryString = params
                    .filter(p => p.key)
                    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                    .join('&');
                setUrl(baseUrl + (queryString ? `?${queryString}` : ''));
            }
        };
        constructUrl();
    }, [baseUrl, params]);

    const addParam = () => setParams([...params, { key: '', value: '' }]);
    const removeParam = (index) => setParams(params.filter((_, i) => i !== index));
    const updateParam = (index, field, value) => {
        const newParams = [...params];
        newParams[index][field] = value;
        setParams(newParams);
    };

    const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
    const removeHeader = (index) => setHeaders(headers.filter((_, i) => i !== index));
    const updateHeader = (index, field, value) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    const parseRawHeaders = () => {
        try {
            const cleanedInput = rawHeadersInput.replace(/[{}]/g, '').trim();
            if (!cleanedInput) {
                setHeaders([{ key: '', value: '' }]);
                return;
            }
            const pairs = cleanedInput.split(',').map(pair => pair.trim());
            const parsedHeaders = pairs.map(pair => {
                const [key, value] = pair.split(':').map(part => part.trim().replace(/['"]/g, ''));
                return { key, value };
            });
            setHeaders(parsedHeaders);
        } catch (error) {
            alert('Invalid headers format!');
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const headerObject = headers.reduce((acc, header) => {
                if (header.key && header.value) acc[header.key] = header.value;
                return acc;
            }, {});

            const options = {
                method,
                headers: headerObject,
            };

            if (method !== 'GET' && body) options.body = body;

            const proxyUrl = 'https://proxy.cors.sh/';
            const res = await fetch(proxyUrl + url, options);

            const contentType = res.headers.get('Content-Type');
            const data = contentType?.includes('application/json')
                ? await res.json()
                : await res.text();

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers),
                data,
            });
        } catch (error) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6" style={{overflowY: 'auto'}}>
                <div className="flex gap-4">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="bg-gray-700 text-white m-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
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
                        className="flex-1 bg-gray-700 text-white my-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
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

                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex gap-4 mb-4">
                        <button
                            className={`px-4 py-2 rounded-lg ${activeTab === 'params' ? 'bg-gray-600' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('params')}
                        >
                            Params
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${activeTab === 'headers' ? 'bg-gray-600' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('headers')}
                        >
                            Headers
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${activeTab === 'body' ? 'bg-gray-600' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('body')}
                        >
                            Body
                        </button>
                    </div>
                    <div className='max-h-96 overflow-y-auto'>

                        {activeTab === 'params' && (
                            <div className="space-y-4">
                                {params.map((param, index) => (
                                    <div key={index} className="flex gap-4 w-full">
                                        <input
                                            type="text"
                                            value={param.key}
                                            onChange={(e) => updateParam(index, 'key', e.target.value)}
                                            placeholder="Param Key"
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
                                        />
                                        <input
                                            type="text"
                                            value={param.value}
                                            onChange={(e) => updateParam(index, 'value', e.target.value)}
                                            placeholder="Param Value"
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
                                        />
                                        <button
                                            onClick={() => removeParam(index)}
                                            className="p-2 hover:bg-gray-600 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addParam}
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                >
                                    <Plus className="w-4 h-4" /> Add Param
                                </button>
                            </div>
                        )}

                        {activeTab === 'headers' && (
                            <div className="space-y-4">
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

                                {useRawHeaders ? (
                                    <>
                                        <textarea
                                            value={rawHeadersInput}
                                            onChange={(e) => setRawHeadersInput(e.target.value)}
                                            placeholder={`Paste headers as key-value pairs\n(e.g. {'Content-Type: application/json'})`}
                                            className="w-full h-24 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        />
                                        <button
                                            onClick={parseRawHeaders}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            Parse Headers
                                        </button>
                                    </>
                                ) : (
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
                        {activeTab === 'body' && (
                            <div className="space-y-4">
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Enter request body (JSON)"
                                    className="w-full h-48 bg-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                />
                            </div>
                        )}
                    </div>

                </div>

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
                                        {JSON.stringify(response.data, null, 2)}
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