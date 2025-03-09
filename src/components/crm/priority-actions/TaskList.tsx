
import { useEffect, useState } from 'react';
import { TaskItem } from './TaskItem';
import { useTasks, Task } from './hooks/useTasks';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';

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
  const [completionConfirmTaskId, setCompletionConfirmTaskId] = useState<string | null>(null);
  
  const {
    tasks,
    isLoading,
    updateCompletion,
    updateUrgency,
    deleteTask,
    isUpdating,
    isDeleting,
    refetch
  } = useTasks(category, showCompleted);

  // Force an initial data fetch when component mounts
  useEffect(() => {
    console.log("TaskList mounted - forcing data refresh");
    refetch();
  }, []);

  // Add a debug log to see what tasks we're getting
  useEffect(() => {
    console.log("Current tasks in TaskList:", tasks);
  }, [tasks]);

  if (isLoading && !tasks.length) {
    return <PriorityActionsSkeleton />;
  }

  if (!tasks.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No {showCompleted ? "completed" : "active"} tasks found{category && category !== 'All' ? ` for category: ${category}` : ''}.
      </div>
    );
  }

  const handleCompletionChange = (taskId: string, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTaskId(taskId);
    } else {
      updateCompletion(taskId, false);
    }
  };

  const confirmTaskCompletion = () => {
    if (completionConfirmTaskId) {
      updateCompletion(completionConfirmTaskId, true);
      setCompletionConfirmTaskId(null);
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateCompletion={(completed) => handleCompletionChange(task.id, completed)}
          onUpdateUrgency={(urgent) => updateUrgency(task.id, urgent)}
          onDelete={() => deleteTask(task.id)}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onSelect={() => onItemSelected?.(task.id)}
        />
      ))}

      <CompletionConfirmDialog
        open={!!completionConfirmTaskId}
        onOpenChange={(open) => {
          if (!open) setCompletionConfirmTaskId(null);
        }}
        onConfirm={confirmTaskCompletion}
        itemType="task"
      />
    </div>
  );
};
