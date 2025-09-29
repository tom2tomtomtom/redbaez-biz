import React, { useState } from 'react';
import { UnifiedTaskItem } from './UnifiedTaskItem';
import { useTaskData } from './hooks/useTaskData';
import { useTaskMutations } from './hooks/useTaskMutations';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Filter } from 'lucide-react';
import { TaskListErrorState } from './components/TaskListErrorState';
import logger from '@/utils/logger';

interface UnifiedTaskListProps {
  title?: string;
  showAddButton?: boolean;
  onAddTask?: () => void;
  clientId?: number; // Optional client filter
}

export const UnifiedTaskList: React.FC<UnifiedTaskListProps> = ({
  title = "Tasks",
  showAddButton = true,
  onAddTask,
  clientId
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch tasks with filters
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useTaskData({
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
    clientId
  });

  // Task mutations
  const {
    updateTask,
    deleteTask,
    isUpdating,
    isDeleting
  } = useTaskMutations();

  logger.info(`UnifiedTaskList rendered with ${tasks.length} tasks`);

  // Handle completion toggle
  const handleCompletionToggle = async (task: Task, completed: boolean) => {
    try {
      await updateTask({
        ...task,
        status: completed ? 'completed' : 'pending'
      });
    } catch (error) {
      logger.error('Failed to update task completion:', error);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (task: Task, priority: TaskPriority) => {
    try {
      await updateTask({
        ...task,
        priority,
        urgent: priority === 'urgent' // Update legacy urgent field
      });
    } catch (error) {
      logger.error('Failed to update task priority:', error);
    }
  };

  // Handle delete
  const handleDelete = async (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task);
      } catch (error) {
        logger.error('Failed to delete task:', error);
      }
    }
  };

  // Get task counts for badges
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length
  };

  if (error) {
    return (
      <TaskListErrorState
        error={error}
        onRefresh={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant="secondary">{taskCounts.all}</Badge>
          {taskCounts.urgent > 0 && (
            <Badge className="bg-red-500 text-white">{taskCounts.urgent} urgent</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: TaskStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value: TaskPriority | 'all') => setPriorityFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="normal">🔵 Normal</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Task Button */}
          {showAddButton && (
            <Button onClick={onAddTask}>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tasks...</span>
        </div>
      )}

      {/* Task List */}
      {!isLoading && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks found with current filters</p>
              {showAddButton && (
                <Button
                  onClick={onAddTask}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus size={16} className="mr-2" />
                  Add your first task
                </Button>
              )}
            </div>
          ) : (
            tasks.map((task) => (
              <UnifiedTaskItem
                key={task.id}
                task={task}
                onUpdateCompletion={(completed) => handleCompletionToggle(task, completed)}
                onUpdatePriority={(priority) => handlePriorityChange(task, priority)}
                onDelete={() => handleDelete(task)}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && tasks.length > 0 && (
        <div className="flex items-center gap-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            <strong>{taskCounts.pending}</strong> pending •{' '}
            <strong>{taskCounts.in_progress}</strong> in progress •{' '}
            <strong>{taskCounts.completed}</strong> completed
          </div>
          {taskCounts.urgent > 0 && (
            <div className="text-sm text-red-600">
              <strong>{taskCounts.urgent}</strong> urgent tasks need attention
            </div>
          )}
        </div>
      )}
    </div>
  );
};