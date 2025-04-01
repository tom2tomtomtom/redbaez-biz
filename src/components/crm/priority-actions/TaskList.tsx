
import { TaskItem } from './TaskItem';
import { useTaskList } from './hooks/useTaskList';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { TaskListHeader } from './components/TaskListHeader';
import { TaskListEmptyState } from './components/TaskListEmptyState';
import { TaskListErrorState } from './components/TaskListErrorState';
import { useEffect } from 'react';
import logger from '@/utils/logger';

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
  // Use our custom hook to handle all the task list logic
  const {
    filteredTasks,
    isLoading,
    error,
    isProcessing,
    handleRefresh,
    handleTaskDelete,
    handleCompletionChange,
    updateUrgency,
    completionConfirmTask,
    setCompletionConfirmTask,
    confirmTaskCompletion,
    refreshKey
  } = useTaskList({ category, showCompleted });
  
  useEffect(() => {
    logger.info("TaskList mounted with:", { 
      category, 
      showCompleted, 
      taskCount: filteredTasks?.length || 0,
      hasError: !!error
    });
    
    // Force a refresh when component mounts to ensure we have fresh data
    handleRefresh();
  }, [category, showCompleted]);
  
  console.log("TaskList rendering with:", { 
    category, 
    showCompleted, 
    taskCount: filteredTasks?.length || 0,
    isLoading,
    hasError: !!error,
    refreshKey
  });
  
  // Show loading skeleton while initial data loads
  if (isLoading && !filteredTasks.length) {
    return <PriorityActionsSkeleton />;
  }

  // Show error state if there was an error
  if (error) {
    return <TaskListErrorState error={error} onRefresh={handleRefresh} />;
  }

  // Show empty state if there are no tasks
  if (!filteredTasks.length) {
    return (
      <TaskListEmptyState 
        showCompleted={showCompleted} 
        category={category}
        onRefresh={handleRefresh}
      />
    );
  }

  // Show the task list
  return (
    <div className="space-y-2">
      <TaskListHeader 
        onRefresh={handleRefresh} 
        tasksCount={filteredTasks.length}
        isLoading={isProcessing}
      />
      
      {filteredTasks.map((task) => (
        <TaskItem
          key={`${task.id}-${refreshKey}`}
          task={task}
          onUpdateCompletion={(completed) => handleCompletionChange(task, completed)}
          onUpdateUrgency={(urgent) => updateUrgency(task, urgent)}
          onDelete={() => handleTaskDelete(task)}
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
