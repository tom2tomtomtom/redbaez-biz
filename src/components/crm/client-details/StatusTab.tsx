import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

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
        <h3 className="text-lg font-semibold">Status History</h3>
        
        <ScrollArea className="h-[200px] rounded-md border p-4">
          {statusHistory && statusHistory.map((entry: any) => (
            <div key={entry.id} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{entry.status}</span>
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

        {notes && (
          <Card className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Preview</h4>
            <div className="space-y-2">
              {status && <p className="font-medium capitalize">{status}</p>}
              <p className="text-sm text-gray-700">{notes}</p>
            </div>
          </Card>
        )}

        <Button type="submit" disabled={isSubmitting || !status}>
          {isSubmitting ? "Updating..." : "Update Status"}
        </Button>
      </form>
    </div>
  );
};