import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PriorityActionItem } from './PriorityActionItem';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';

const fetchPriorityClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('next_due_date', { ascending: true })
    .limit(2);
    
  if (error) throw error;
  return data;
};

export const PriorityActions = () => {
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  if (isLoading) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-50 rounded-lg">
            Error loading priority actions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Priority Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients?.map((client) => (
            <PriorityActionItem key={client.id} client={client} />
          ))}

          {(!clients || clients.length === 0) && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-600 text-center">No priority actions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};