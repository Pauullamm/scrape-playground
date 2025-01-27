import React from 'react';
import clsx from 'clsx';

export default function RequestRow({ request, index, expandedRow, setExpandedRow }) {
  const hasData = (request.json_api_responses?.length > 0) ||
    (request.js_variables?.length > 0);

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-orange-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleRowClick = () => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <React.Fragment>
      <tr
        className={clsx('cursor-pointer group hover:bg-[#2A2A2A]', {
          'bg-[#2A2A2A]': expandedRow === index,
        })}
        onClick={handleRowClick}
      >
        <td className="p-2">
          <div className="flex items-center gap-2">
            <span className={clsx(
              'inline-block px-2 py-1 rounded',
              getMethodColor(request.method)
            )}>
              {request.method}
            </span>

            {hasData && (
              <div className="flex items-center text-sm text-gray-400 transition-opacity opacity-90 hover:opacity-100">
                <span className="mr-1.5">
                  {request.json_api_responses?.length || 0} JSON •
                  {request.js_variables?.length || 0} JS
                </span>
                <svg
                  className="w-4 h-4 transition-transform transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        </td>
        <td className="p-2">{request.url}</td>
        <td className="p-2">{request.response_status || 'N/A'}</td>
      </tr>

      {/* Expanded content remains the same */}
      {expandedRow === index && (
        <tr className='text-wrap max-w-[300px] overflow-x-auto'>
          <td colSpan="3" className="p-2 bg-[#2A2A2A]">
            <div className="p-4 bg-[#1A1A1A] rounded-lg">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                <code>{JSON.stringify(request.headers, null, 2)}</code>
              </pre>
              {/* Show JSON responses if present */}
              {request.json_api_responses?.map((response, i) => (
                <div key={`json-${i}`} className="mt-4 p-3 bg-[#2A2A2A] rounded text-wrap">
                  <div className="text-green-400 mb-2">JSON Response {i + 1}:</div>
                  <pre>{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              ))}

              {/* Show JS variables if present */}
              {request.js_variables?.map((variable, i) => (
                <div key={`js-${i}`} className="mt-4 p-3 bg-[#2A2A2A] rounded text-wrap">
                  <div className="text-blue-400 mb-2">JS Variable: {variable.var_name}</div>
                  <pre className="json-pre">
                    {JSON.stringify(variable.data, null, 2)}
                  </pre>
                </div>
              ))}

            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

