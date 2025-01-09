import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

type HistoryEntry = {
  id: string;
  client_id: number | null;
  notes: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  created_by: string | null;
  profiles: {
    full_name: string | null;
  } | null;
  clients: {
    name: string | null;
  } | null;
}

export const TaskHistory = () => {
  const { data: history, isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['task-history'],
    queryFn: async () => {
      console.log('Fetching task history');
      const { data, error } = await supabase
        .from('next_steps_history')
        .select('*, profiles(full_name), clients(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        throw error;
      }
      console.log('Fetched history data:', data);
      return data;
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="h-4 w-4" />
          View Task History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading...
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-500">
                        {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {entry.profiles?.full_name || 'Unknown user'}
                      </div>
                    </div>
                    {entry.clients?.name && (
                      <div className="text-sm text-blue-600">
                        Client: {entry.clients.name}
                      </div>
                    )}
                    <div className="text-sm">{entry.notes || 'No notes'}</div>
                    {entry.due_date && (
                      <div className="text-sm text-gray-500">
                        Due date: {format(new Date(entry.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {entry.completed_at && (
                      <div className="text-sm text-green-600">
                        Completed: {format(new Date(entry.completed_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No history available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};