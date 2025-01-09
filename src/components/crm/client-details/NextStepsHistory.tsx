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

interface NextStepsHistoryProps {
  clientId: number;
}

export const NextStepsHistory: React.FC<NextStepsHistoryProps> = ({ clientId }) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['next-steps-history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('next_steps_history')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="h-4 w-4" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Next Steps History</DialogTitle>
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
                    <div className="text-sm text-gray-500">
                      {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                    <div className="font-medium">Notes:</div>
                    <div className="text-sm">{entry.notes || 'No notes'}</div>
                    {entry.due_date && (
                      <>
                        <div className="font-medium">Due Date:</div>
                        <div className="text-sm">
                          {format(new Date(entry.due_date), 'MMM d, yyyy')}
                        </div>
                      </>
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