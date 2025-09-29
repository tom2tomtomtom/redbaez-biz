
import React, { useState } from 'react';
import { UnifiedTaskList } from './UnifiedTaskList';
import { TaskDialog } from './TaskDialog';
import { Task } from '@/types/task';
import logger from '@/utils/logger';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  initialCategory?: string;
  onTaskClick?: (taskId: string) => void;
  clientId?: number; // Optional client filter
}

export const PriorityActions = ({
  hideAddButton = false,
  initialCategory,
  onTaskClick,
  clientId
}: PriorityActionsProps) => {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  logger.info('PriorityActions rendered', { hideAddButton, initialCategory, clientId });

  const handleTaskSelected = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      // For now, we'll just log the selection
      logger.info('Task selected:', taskId);
      // TODO: Implement task details view if needed
    }
  };

  return (
    <div className="space-y-6">
      <UnifiedTaskList
        title="Priority Actions"
        showAddButton={!hideAddButton}
        onAddTask={() => setIsNewTaskOpen(true)}
        clientId={clientId}
      />

      <TaskDialog
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => setIsNewTaskOpen(false)}
        defaultCategory={initialCategory}
      />

      {selectedTask && (
        <TaskDialog
          isOpen={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
          task={selectedTask}
          onSaved={() => setSelectedTask(null)}
          defaultCategory={initialCategory}
        />
      )}
    </div>
  );
};
