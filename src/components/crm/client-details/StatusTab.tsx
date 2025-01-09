import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface StatusTabProps {
  clientId: number;
  currentStatus: string | null;
}

export const StatusTab = ({ clientId, currentStatus }: StatusTabProps) => {
  const [status, setStatus] = useState(currentStatus || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the latest status history entry
  const { data: latestStatusHistory } = useQuery({
    queryKey: ['statusHistory', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_status_history')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

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

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Status</h3>
        
        {latestStatusHistory && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-600 mb-2">Latest Status Update:</p>
            <p className="font-medium">{latestStatusHistory.status}</p>
            {latestStatusHistory.notes && (
              <p className="text-sm text-gray-700 mt-2">{latestStatusHistory.notes}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Updated: {new Date(latestStatusHistory.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
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
    </div>
  );
};