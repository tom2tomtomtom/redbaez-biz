
import { useEffect, useState, useRef } from 'react';
import { TaskItem } from './TaskItem';
import { useTaskData } from './hooks/useTaskData';
import { useTaskMutations } from './hooks/useTaskMutations';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface TaskListProps {
  category?: string;
  showCompleted?: boolean;
  onItemSelected?: (taskId: string) => void;
}

export const TaskList = ({ 
  category,
  showCompleted = false,
  onItemSelected
}: TaskListProps) => {
  const [completionConfirmTask, setCompletionConfirmTask] = useState<any | null>(null);
  const initialLoadDone = useRef(false);
  
  // Use our unified task data hook
  const { data: tasks = [], isLoading, error, refetch } = useTaskData(category, showCompleted);
  
  // Use our simplified task mutations
  const { 
    isProcessing, 
    updateCompletion, 
    updateUrgency, 
    deleteTask,
    invalidateTaskQueries
  } = useTaskMutations();

  // Refresh data only once when component mounts
  useEffect(() => {
    if (!initialLoadDone.current) {
      console.log("TaskList mounted - refreshing data");
      refetch();
      initialLoadDone.current = true;
      
      // Set up periodic refresh every 2 minutes instead of every minute
      const intervalId = setInterval(() => {
        console.log("Periodic task refresh");
        refetch();
      }, 120000); // 2 minutes
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [category, showCompleted, refetch]);

  const handleRefresh = async () => {
    toast({
      title: "Refreshing tasks",
      description: "Fetching latest task data..."
    });
    
    try {
      await invalidateTaskQueries();
      await refetch();
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      toast({
        title: "Error refreshing tasks",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading && !tasks.length) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading tasks: {error.message}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">
          No {showCompleted ? "completed" : "active"} tasks found{category && category !== 'All' ? ` for category: ${category}` : ''}.
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  const handleCompletionChange = (task: any, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTask(task);
    } else {
      updateCompletion(task, false);
    }
  };

  const confirmTaskCompletion = () => {
    if (completionConfirmTask) {
      updateCompletion(completionConfirmTask, true);
      setCompletionConfirmTask(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Tasks
        </Button>
      </div>
      
      {tasks.map((task) => (
        <TaskItem
          key={`${task.source_table}-${task.id}`}
          task={task}
          onUpdateCompletion={(completed) => handleCompletionChange(task, completed)}
          onUpdateUrgency={(urgent) => updateUrgency(task, urgent)}
          onDelete={() => deleteTask(task)}
          isUpdating={isProcessing}
          isDeleting={isProcessing}
          onSelect={() => onItemSelected?.(task.id)}
        />
      ))}

      <CompletionConfirmDialog
        open={!!completionConfirmTask}
        onOpenChange={(open) => {
          if (!open) setCompletionConfirmTask(null);
        }}
        onConfirm={confirmTaskCompletion}
        itemType="task"
      />
    </div>
  );
};
