import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatusTabProps {
  clientId: number;
  currentStatus: string | null;
}

export const StatusTab = ({ clientId, currentStatus }: StatusTabProps) => {
  const [status, setStatus] = useState(currentStatus || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all status history entries
  const { data: statusHistory } = useQuery({
    queryKey: ['statusHistory', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_status_history')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get the latest status notes
  const currentStatusNotes = statusHistory?.[0]?.notes || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert new status history record
      const { error: historyError } = await supabase
        .from('client_status_history')
        .insert({
          client_id: clientId,
          status,
          notes,
        });

      if (historyError) throw historyError;

      // Update client's current status
      const { error: clientError } = await supabase
        .from('clients')
        .update({ status })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Show success message and reset form
      toast({
        title: "Status Updated",
        description: "The client's status has been successfully updated.",
      });
      setNotes('');
      setIsEditingStatus(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['statusHistory', clientId] });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      {/* Current Status Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Status</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingStatus(!isEditingStatus)}
          >
            {isEditingStatus ? 'Cancel' : 'Edit Status'}
          </Button>
        </div>
        
        {isEditingStatus ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Select value={status} onValueChange={setStatus}>
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
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this status change..."
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !status}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(currentStatus || '')}>
                {currentStatus || 'Not Set'}
              </Badge>
            </div>
            {currentStatusNotes && (
              <p className="text-sm text-gray-600">{currentStatusNotes}</p>
            )}
          </div>
        )}
      </div>

      {/* Status History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status History</h3>
        <ScrollArea className="h-[200px] rounded-md border p-4">
          {statusHistory && statusHistory.map((entry: any) => (
            <div key={entry.id} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={getStatusBadgeVariant(entry.status)}>
                  {entry.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-gray-700">{entry.notes}</p>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};