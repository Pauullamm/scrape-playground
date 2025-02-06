import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import RequestRow from './RequestRow';

export default function RequestCapture({ state, setState }) {
  const [url, setUrl] = useState(state.url ? state.url : '');
  const [resources, setResources] = useState(state.resources ? state.resources : []);
  const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded
  const [filterKeyword, setFilterKeyword] = useState(''); // Filter by keyword
  const [filterMethod, setFilterMethod] = useState(''); // Filter by HTTP method
  const [sortBy, setSortBy] = useState('method'); // Sort by method, URL, or status
  const [sortOrder, setSortOrder] = useState('asc'); // Sort order (asc or desc)
  const [loading, setLoading] = useState(false)
  const [resourceError, setResourceError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const keys = useSelector((state) => state.settings);
  const API_KEY = keys.openaiKey;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Send the request to your backend
      const response = await fetch(`${BACKEND_URL}/background_capture`, {
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

      // Parse the response data from your backend
      const data = await response.json();
      if (data) {
        console.log(data)
        const row_data = []
        for (let i=0; i < data.length; i++) {
          var item = data[i]
          if (item.content === 'root') {
            continue
          } else {
            row_data.push(item)
          }
          
        }
        setResources(row_data); // Assuming the backend returns an array of request_data objects
        
        setState({
          url: url,
          resources: row_data
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

  // Filter and sort resources
  const filteredResources = resources
    .filter((request) => {
      const matchesKeyword = request.url.toLowerCase().includes(filterKeyword.toLowerCase());
      const matchesMethod = filterMethod ? request.method.toLowerCase() === filterMethod.toLowerCase() : true;
      return matchesKeyword && matchesMethod;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'method') {
        comparison = a.method.localeCompare(b.method);
      } else if (sortBy === 'url') {
        comparison = a.url.localeCompare(b.url);
      } else if (sortBy === 'status') {
        comparison = (a.response_status || '').toString().localeCompare((b.response_status || '').toString());
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="h-full p-6">
      <div className="flex flex-col h-full">
        <p className="mb-2 text-gray-400 text-white text-base">Sniff and analyze background HTTP requests</p>
        <p className="text-gray-400 text-sm mb-2">This will listen for additional resource requests made when a site is loaded and lists them out accordingly</p>

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
              disabled={loading} // Disable button while loading
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
        {/* Filter and Sort Controls */}
        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="Filter by keyword"
            className="flex-1 bg-[#1A1A1A] rounded-lg text-xs border border-[#2A2A2A] p-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
          />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-[#1A1A1A] rounded-lg text-xs border border-[#2A2A2A] p-2 text-gray-300 focus:outline-none focus:border-[#3A3A3A] min-w-0"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1A1A1A] rounded-lg text-xs border border-[#2A2A2A] p-2 text-gray-300 focus:outline-none focus:border-[#3A3A3A] min-w-0"
          >
            <option value="method">Sort by Method</option>
            <option value="url">Sort by URL</option>
            <option value="status">Sort by Status</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#1A1A1A] rounded-lg text-xs border border-[#2A2A2A] p-1 text-gray-300 focus:outline-none focus:border-[#3A3A3A] min-w-0"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Results Table */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4 overflow-y-auto">
          {filteredResources.length > 0 ? (
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="p-2 text-left">Method</th>
                  <th className="p-2 text-left">URL</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((request, index) => (
                  <RequestRow
                    key={index}
                    request={request}
                    index={index}
                    expandedRow={expandedRow}
                    setExpandedRow={setExpandedRow}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <pre className="text-sm text-gray-300">
              {resourceError ? <code>// Server Error</code> : <code>// No matching requests found</code>}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}