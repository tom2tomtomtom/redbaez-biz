
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { TaskDialog } from './TaskDialog';
import { PriorityItemsList } from './PriorityItemsList';
import { usePriorityData } from './hooks/usePriorityData';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  category?: string;
  onTaskClick?: (task: Tables<'general_tasks'>) => void;
}

export const PriorityActions = ({ 
  hideAddButton = false, 
  category,
  onTaskClick 
}: PriorityActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render
  const queryClient = useQueryClient();
  const { allItems, isLoading, error } = usePriorityData(category);

  console.log('Priority Actions - all items:', allItems); // Debug log

  // Force refresh when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
  }, [queryClient]);

  const handleTaskSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    setIsDialogOpen(false);
    setEditingTask(null);
    // Force refresh
    setRefreshKey(prev => prev + 1);
  };

  const handleTaskClick = (task: Tables<'general_tasks'>) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      setEditingTask(task);
      setIsDialogOpen(true);
    }
  };
  
  const handleTaskUpdated = () => {
    // Force refresh after task update or delete
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    console.error('Priority Actions error:', error); // Debug log
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
        <CardTitle>
          {category 
            ? `${category} Tasks` 
            : `Priority Actions for ${new Date().toLocaleString('default', { month: 'long' })}`
          }
        </CardTitle>
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
        <div>
          <PriorityItemsList 
            key={refreshKey} // Force re-render on refreshKey change
            items={allItems}
            onTaskClick={handleTaskClick}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>
      </CardContent>

      <TaskDialog
        key={`dialog-${refreshKey}`} // Force re-render dialog too
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
        defaultCategory={category}
      />
    </Card>
  );
};
