import logger from '@/utils/logger';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { StatusForm } from './status/StatusForm';
import { CurrentStatus } from './status/CurrentStatus';
import { StatusHistory } from './status/StatusHistory';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    let previousData: any = null;

    try {
      // Optimistically update the client data in cache
      previousData = queryClient.getQueryData(['client', clientId]);
      queryClient.setQueryData(['client', clientId], (old: any) => ({
        ...old,
        status: newStatus,
      }));

      // Insert new status history record
      const { error: historyError } = await supabase
        .from('client_status_history')
        .insert({
          client_id: clientId,
          status: newStatus,
          notes: `Status changed to ${newStatus}`,
        });

      if (historyError) throw historyError;

      // Update client's current status
      const { error: clientError, data: updatedClient } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId)
        .select()
        .single();

      if (clientError) throw clientError;

      // Update cache with the server response
      queryClient.setQueryData(['client', clientId], updatedClient);
      setStatus(newStatus);

      toast({
        title: "Status Updated",
        description: "The client's status has been successfully updated.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['statusHistory', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] }); // Add this line to refresh the clients list
    } catch (error) {
      logger.error('Error updating status:', error);
      // Revert cache to previous state on error
      if (previousData) {
        queryClient.setQueryData(['client', clientId], previousData);
      }
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let previousData: any = null;

    try {
      // Optimistically update the client data in cache
      previousData = queryClient.getQueryData(['client', clientId]);
      queryClient.setQueryData(['client', clientId], (old: any) => ({
        ...old,
        status: status,
      }));

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
      const { error: clientError, data: updatedClient } = await supabase
        .from('clients')
        .update({ status })
        .eq('id', clientId)
        .select()
        .single();

      if (clientError) throw clientError;

      // Update cache with the server response
      queryClient.setQueryData(['client', clientId], updatedClient);

      toast({
        title: "Status Updated",
        description: "The client's status has been successfully updated.",
      });
      setNotes('');
      setIsEditingStatus(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['statusHistory', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] }); // Add this line to refresh the clients list
    } catch (error) {
      logger.error('Error updating status:', error);
      // Revert cache to previous state on error
      if (previousData) {
        queryClient.setQueryData(['client', clientId], previousData);
      }
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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
          <Select
            value={currentStatus || ''}
            onValueChange={handleStatusChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-[180px]">
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
        
        {currentStatusNotes && (
          <div className="text-sm text-gray-600">
            {currentStatusNotes}
          </div>
        )}
      </div>

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
        <Button
          variant="outline"
          onClick={() => setIsEditingStatus(true)}
          className="mt-4"
        >
          Add Status Note
        </Button>
      )}
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <History className="mr-2 h-4 w-4" />
            View Status History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Status History</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <StatusHistory history={statusHistory || []} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
