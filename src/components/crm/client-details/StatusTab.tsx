import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { StatusForm } from './status/StatusForm';
import { CurrentStatus } from './status/CurrentStatus';
import { StatusHistory } from './status/StatusHistory';

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

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      {isEditingStatus ? (
        <StatusForm
          status={status}
          notes={notes}
          isSubmitting={isSubmitting}
          onStatusChange={setStatus}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
        />
      ) : (
        <CurrentStatus
          status={currentStatus || ''}
          notes={currentStatusNotes}
          onEditClick={() => setIsEditingStatus(true)}
        />
      )}
      
      <StatusHistory history={statusHistory || []} />
    </div>
  );
};