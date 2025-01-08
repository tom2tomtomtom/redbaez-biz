import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PriorityActionItem } from './PriorityActionItem';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery({
    queryKey: ['generalTasks'],
    queryFn: fetchGeneralTasks,
  });

  const handleTaskSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Priority Actions for {new Date().toLocaleString('default', { month: 'long' })}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTask(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <TaskForm 
              task={editingTask} 
              onSaved={handleTaskSaved} 
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTask(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {tasks?.map((task) => (
            <div key={task.id} onClick={() => {
              setEditingTask(task);
              setIsDialogOpen(true);
            }} className="cursor-pointer">
              <GeneralTaskItem task={task} />
            </div>
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