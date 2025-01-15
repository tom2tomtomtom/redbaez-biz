import React from 'react';
import { StatusBadge } from './StatusBadge';
import { formatNotes } from './utils';

interface StatusHistoryEntry {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface StatusHistoryProps {
  history: StatusHistoryEntry[];
}

export const StatusHistory = ({ history }: StatusHistoryProps) => {
  return (
    <div className="space-y-4">
      {history?.map((entry) => (
        <div key={entry.id} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
          <div className="flex items-center justify-between mb-2">
            <StatusBadge status={entry.status} />
            <span className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
            </span>
          </div>
          {entry.notes && (
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {formatNotes(entry.notes)}
            </div>
          )}
        </div>
      ))}
      {history?.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No status history available</p>
      )}
    </div>
  );
};