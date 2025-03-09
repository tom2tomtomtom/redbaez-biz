
import { useTasksQuery } from './useTasksQuery';
import { useTasksMutations } from './useTasksMutations';
import { Task } from './taskTypes';

export type { Task } from './taskTypes';

export const useTasks = (category?: string, showCompleted = false) => {
  const { data: tasks = [], isLoading, refetch } = useTasksQuery(category, showCompleted);
  const { isUpdating, isDeleting, updateCompletion, updateUrgency, deleteTask } = useTasksMutations();

  return {
    tasks,
    isLoading,
    isUpdating,
    isDeleting,
    updateCompletion,
    updateUrgency,
    deleteTask,
    refetch
  };
};
