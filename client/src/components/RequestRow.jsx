import React from 'react';
import clsx from 'clsx';  // Importing clsx for conditional class management

export default function RequestRow({ request, index, expandedRow, setExpandedRow }) {
  // Color coding for HTTP methods
  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-500';
      case 'POST':
        return 'bg-blue-500';
      case 'PUT':
        return 'bg-orange-500';
      case 'DELETE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Toggle expanded row
  const handleRowClick = () => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <React.Fragment>
      <tr
        className={clsx('cursor-pointer hover:bg-[#2A2A2A]', {
          'bg-[#2A2A2A]': expandedRow === index,
        })}
        onClick={handleRowClick}
      >
        <td className="p-2">
          <span
            className={clsx(
              'inline-block px-2 py-1 rounded',
              getMethodColor(request.method)
            )}
          >
            {request.method}
          </span>
        </td>
        <td className="p-2">{request.url}</td>
        <td className="p-2">{request.response_status || 'N/A'}</td>
      </tr>

      {/* Expanded Content */}
      {expandedRow === index && (
        <tr>
          <td colSpan="3" className="p-2 bg-[#2A2A2A]">
            <div className="p-4 bg-[#1A1A1A] rounded-lg">
              <pre className="text-sm">
                <code>{JSON.stringify(request.headers, null, 2)}</code>
              </pre>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}