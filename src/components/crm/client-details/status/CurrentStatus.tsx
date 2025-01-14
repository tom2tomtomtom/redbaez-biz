import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { formatNotes } from './utils';

interface CurrentStatusProps {
  status: string;
  notes: string;
  onEditClick: () => void;
}

export const CurrentStatus = ({ status, notes, onEditClick }: CurrentStatusProps) => {
  return (
    <div className="border-b pb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Current Status</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
        >
          Edit Status
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <StatusBadge status={status} />
        </div>
        {notes && (
          <div className="text-sm text-gray-600 whitespace-pre-line">
            {formatNotes(notes)}
          </div>
        )}
      </div>
    </div>
  );
};