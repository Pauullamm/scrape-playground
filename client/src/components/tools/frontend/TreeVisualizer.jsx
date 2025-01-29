import React, { useState } from 'react';
import clsx from 'clsx';
import { Folder, FileText, Copy } from 'lucide-react'

const copyJson = async (data) => {
  if (!data) {
    return;
  }
  const jsonString = JSON.stringify(data, null, 4);
  await navigator.clipboard.writeText(jsonString);
};

const TreeNode = ({ node, depth = 0, isLast = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isStringNode = typeof node === 'string';
  const content = isStringNode ? node : node?.content || '[empty]';
  const children = isStringNode ? [] : node?.children || [];
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col">
      {/* Node Content */}
      <div
        className={clsx('flex items-start hover:bg-[#2A2A2A] cursor-pointer', {
          'ml-4': depth > 0
        })}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => !isStringNode && setIsExpanded(!isExpanded)}
      >
        {/* Vertical connector line */}
        {depth > 0 && (
          <div className="absolute w-px h-full bg-gray-600 left-2 -translate-x-full" />
        )}

        {/* Expand/collapse icon */}
        {!isStringNode && hasChildren && (
          <div className="mr-2">
            <svg
              className={clsx('w-4 h-4 transform transition-transform', {
                'rotate-90': isExpanded
              })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Node content */}
        <div className="flex items-center py-1 gap-2">
          {/* Folder/document icon */}
          {!isStringNode ? (
            <Folder size={14}/>
          ) : (
            <FileText size={14} />
          )}

          {/* Content text */}
          <span className={clsx('font-mono text-sm break-words', {
            'text-gray-300': !isStringNode,
            'text-gray-400': isStringNode
          })}>
            {content}
          </span>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              depth={depth + 1}
              isLast={index === children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TreeVisualizer({ data }) {
  const handleCopy = async () => {
    if (!data) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    alert("Copied JSON")
    await copyJson(data);
  };
  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
      <div className="text-gray-400 text-sm mb-2">Tree Structure Visualization</div>
      <button
        onClick={handleCopy}
        disabled={!data}
        className={clsx(
          'px-3 py-1 text-sm rounded-lg transition-colors flex gap-2',
          'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Copy JSON
        <Copy size={14} className='mt-1'/>
      </button>
      <div className="text-wrap">
        {data ? (
          <TreeNode node={data} depth={0} />
        ) : (
          <div className="text-gray-500">No data to display</div>
        )}
      </div>
    </div>
  );
};