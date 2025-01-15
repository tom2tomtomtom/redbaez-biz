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
        <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
        <Button
          size="sm"
          onClick={onEditClick}
        >
          Update Status
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <StatusBadge status={status} />
        </div>
        {notes && (
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 space-y-4">
              {formatNotes(notes).split('\n\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};