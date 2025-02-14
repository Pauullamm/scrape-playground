import React from 'react';
import clsx from 'clsx';
import TreeVisualizer from './TreeVisualizer';

export default function DataRow({ node, index, expandedRow, setExpandedRow }) {
    const hasData = node.children?.length > 0;

    const handleRowClick = () => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    return (
        <React.Fragment>
            <tr
                className={clsx('rounded-lg cursor-pointer group hover:bg-[#2A2A2A] table-auto', {
                    'bg-[#2A2A2A]': expandedRow === index,
                })}
                onClick={handleRowClick}
            >
                <td className="p-2">
                    <div className="flex items-center gap-2">

                        {hasData && (
                            <div className="flex items-center text-sm text-gray-400 transition-opacity opacity-90 hover:opacity-100">
                                <span className="mr-1.5">
                                    {node.children.length}
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
                <td className="p-2">{node.content || 'N/A'}</td>
            </tr>

            {expandedRow === index && (
                <tr className='text-wrap max-w-[300px] overflow-x-auto'>
                    <td colSpan="3" className="p-2 bg-[#2A2A2A]">
                        <div className="p-4 bg-[#1A1A1A] rounded-lg">
                            {node && node.content ? (
                                // <TreeNode node={node} />
                                <TreeVisualizer data={node}/>
                            ) : (
                                <pre className="text-gray-400">No content available</pre>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}