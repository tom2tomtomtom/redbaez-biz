import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PriorityActionItem } from './PriorityActionItem';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { startOfMonth, endOfMonth } from 'date-fns';

const fetchPriorityClients = async () => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .gte('next_due_date', startDate.toISOString())
    .lte('next_due_date', endDate.toISOString())
    .order('next_due_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

const fetchGeneralTasks = async () => {
  const { data, error } = await supabase
    .from('general_tasks')
    .select('*')
    .order('next_due_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const PriorityActions = () => {
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery({
    queryKey: ['generalTasks'],
    queryFn: fetchGeneralTasks,
  });

  if (isLoadingClients || isLoadingTasks) {
    return <PriorityActionsSkeleton />;
  }

  if (clientsError || tasksError) {
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

  const hasItems = (clients && clients.length > 0) || (tasks && tasks.length > 0);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Priority Actions for {new Date().toLocaleString('default', { month: 'long' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {tasks?.map((task) => (
            <GeneralTaskItem key={task.id} task={task} />
          ))}

          {clients?.map((client) => (
            <PriorityActionItem key={client.id} client={client} />
          ))}

          {!hasItems && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-600 text-center">No priority actions found for this month</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};