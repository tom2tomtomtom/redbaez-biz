
import { useEffect, useRef } from 'react';
import { TaskItem } from './TaskItem';
import { useTaskList } from './hooks/useTaskList';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { TaskListHeader } from './components/TaskListHeader';
import { TaskListEmptyState } from './components/TaskListEmptyState';
import { TaskListErrorState } from './components/TaskListErrorState';
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
  // Use the task list hook to manage state
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
  
  // Force refresh when component first mounts only (prevent loops)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    logger.info("TaskList mounted with:", { 
      category, 
      showCompleted, 
      taskCount: filteredTasks?.length || 0,
      hasError: !!error
    });
    handleRefresh();
  }, [handleRefresh]);
  
  // Debug log for rendering
  logger.info("TaskList rendering with:", { 
    category, 
    showCompleted, 
    taskCount: filteredTasks?.length || 0,
    isLoading,
    hasError: !!error,
    refreshKey
  });
  
  // Show loading state
  if (isLoading && !filteredTasks.length) {
    return <PriorityActionsSkeleton />;
  }

  // Show error state
  if (error) {
    return <TaskListErrorState error={error} onRefresh={handleRefresh} />;
  }

  // Show empty state
  if (!filteredTasks.length) {
    return (
      <TaskListEmptyState 
        showCompleted={showCompleted} 
        category={category}
        onRefresh={handleRefresh}
      />
    );
  }

  // Show task list
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
