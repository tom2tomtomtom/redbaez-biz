import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusFormProps {
  status: string;
  notes: string;
  isSubmitting: boolean;
  onStatusChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const StatusForm = ({
  status,
  notes,
  isSubmitting,
  onStatusChange,
  onNotesChange,
  onSubmit
}: StatusFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any relevant notes about this status change..."
          className="min-h-[100px]"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !status}>
        {isSubmitting ? "Updating..." : "Update Status"}
      </Button>
    </form>
  );
};