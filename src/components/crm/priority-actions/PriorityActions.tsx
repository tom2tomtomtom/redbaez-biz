import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { TaskDialog } from './TaskDialog';
import { PriorityItemsList } from './PriorityItemsList';
import { usePriorityData } from './hooks/usePriorityData';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  category?: string;
}

export const PriorityActions = ({ hideAddButton = false, category }: PriorityActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const queryClient = useQueryClient();
  const { allItems, isLoading, error } = usePriorityData(category);

  const handleTaskSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task: Tables<'general_tasks'>) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Priority Actions for {new Date().toLocaleString('default', { month: 'long' })}</CardTitle>
        {!hideAddButton && (
          <Button onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <PriorityItemsList 
            items={allItems}
            onTaskClick={handleTaskClick}
          />
        </div>
      </CardContent>

      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
        defaultCategory={category}
      />
    </Card>
  );
};