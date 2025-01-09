import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NextStepsHistoryProps {
  clientId: number;
}

export const NextStepsHistory = ({ clientId }: NextStepsHistoryProps) => {
  const { data: nextSteps, isLoading } = useQuery({
    queryKey: ['client-next-steps', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_next_steps')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {nextSteps && nextSteps.length > 0 ? (
            <div className="space-y-4">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="border-l-2 border-gray-200 pl-4 py-2"
                >
                  <p className="text-sm text-gray-500">
                    {format(new Date(step.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="mt-1">{step.notes}</p>
                  {step.due_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {format(new Date(step.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                  {step.completed_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Completed: {format(new Date(step.completed_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No history available</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};