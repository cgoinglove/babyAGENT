'use client';

import { useState } from 'react';
import { NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';
import clsx from 'clsx';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Pause, ChevronDown, ChevronRight } from 'lucide-react';

// Update the type definition to include potential description
type ExtendedNodeThread = NodeThread & {
  description?: string;
};

export default function ThreadDetail({ thread, goBack }: { thread: ExtendedNodeThread; goBack: () => void }) {
  // State for collapsible sections
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);

  // Thread might have a description in metadata
  const description = thread.description;

  // Helper function to format timestamp
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to display JSON or other data properly
  const formatValue = (value: any) => {
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (error) {
        return String(value);
      }
    }
    return String(value);
  };

  // Get status icon
  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'ready':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'stop':
        return <Pause className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full h-full bg-white p-6 overflow-auto">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-gray-900">{thread.name}</h1>
          {thread.description && <p className="text-gray-600 mt-1">{thread.description}</p>}
        </div>
      </div>

      {/* Thread information */}
      <div className="mb-8 bg-gray-50 p-5 rounded-xl shadow-sm">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center">
              {getStatusIcon(thread.status)}
              <span
                className={clsx('ml-2 font-semibold', {
                  'text-blue-600': thread.status === 'ready',
                  'text-yellow-600': thread.status === 'running',
                  'text-green-600': thread.status === 'success',
                  'text-red-600': thread.status === 'fail',
                  'text-gray-600': thread.status === 'stop',
                })}
              >
                {thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{thread.duration || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Started At</p>
            <p className="font-medium">{formatTimestamp(thread.startedAt)}</p>
          </div>
        </div>
      </div>

      {/* Input data */}
      <div className="mb-8">
        <div
          className="flex items-center cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setInputCollapsed(!inputCollapsed)}
        >
          {inputCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
          )}
          <h2 className="text-lg font-medium text-gray-900">Input</h2>
          <span className="ml-2 text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {thread.input.length} items
          </span>
        </div>

        {!inputCollapsed && thread.input.length > 0 ? (
          <div className="space-y-4 mt-4 pl-2">
            {thread.input.map((data, index) => (
              <div
                key={`input-${index}`}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">{data.label}</p>
                <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm whitespace-pre-wrap break-all max-h-96">
                  {formatValue(data.value)}
                </pre>
              </div>
            ))}
          </div>
        ) : !inputCollapsed && thread.input.length === 0 ? (
          <p className="text-gray-500 italic mt-3 pl-10">No input data available</p>
        ) : null}
      </div>

      {/* Output data */}
      <div>
        <div
          className="flex items-center cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOutputCollapsed(!outputCollapsed)}
        >
          {outputCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
          )}
          <h2 className="text-lg font-medium text-gray-900">Output</h2>
          <span className="ml-2 text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {thread.output ? thread.output.length : 0} items
          </span>
        </div>

        {!outputCollapsed && thread.output && thread.output.length > 0 ? (
          <div className="space-y-4 mt-4 pl-2">
            {thread.output.map((data, index) => (
              <div
                key={`output-${index}`}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">{data.label}</p>
                <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm whitespace-pre-wrap break-all max-h-96">
                  {formatValue(data.value)}
                </pre>
              </div>
            ))}
          </div>
        ) : !outputCollapsed && (!thread.output || thread.output.length === 0) ? (
          <p className="text-gray-500 italic mt-3 pl-10">No output data available</p>
        ) : null}
      </div>
    </div>
  );
}
