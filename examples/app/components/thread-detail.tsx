'use client';

import { NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';
import clsx from 'clsx';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Pause } from 'lucide-react';
import JsonView from './shared/json-view';

// Update the type definition to include potential description
type ExtendedNodeThread = NodeThread & {
  description?: string;
};

export default function ThreadDetail({ thread, goBack }: { thread: ExtendedNodeThread; goBack: () => void }) {
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
      } catch {
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

  // Get all process items (inputs and outputs) in a flat structure
  const getAllProcessItems = () => {
    const inputItems = thread.input.map((item) => ({
      label: item.label,
      value: item.value,
    }));

    const outputItems = thread.output
      ? thread.output.map((item) => ({
          label: item.label,
          value: item.value,
        }))
      : [];

    return [...inputItems, ...outputItems];
  };

  const processItems = getAllProcessItems();

  return (
    <div className="w-full h-full bg-white p-6 overflow-auto">
      {/* Header with back button */}
      <div className="flex items-center mb-8 cursor-pointer" onClick={goBack}>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
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

      {/* Process Flow (Combined Input/Output as a simple flat list) */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Process Items</h2>

        {processItems.length > 0 ? (
          <div className="space-y-4">
            {processItems.map((item, index) => (
              <div
                key={`process-${index}`}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">{item.label}</p>
                <JsonView data={item.value} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No process data available</p>
        )}
      </div>
    </div>
  );
}
