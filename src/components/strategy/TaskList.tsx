import { useState } from "react";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { GeneralTaskItem } from "../crm/priority-actions/GeneralTaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "../crm/priority-actions/TaskDialog";
import { format } from "date-fns";

interface TaskListProps {
  tasks: GeneralTaskRow[];
  isLoading: boolean;
  onTasksUpdated: () => void;
  isHistory?: boolean;
}

export const TaskList = ({ tasks, isLoading, onTasksUpdated, isHistory = false }: TaskListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (isHistory) {
      return task.status === 'completed';
    }
    // For active tasks, show both ideas (no due date) and active tasks (with due date)
    return task.status !== 'completed';
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (isHistory) {
      // Sort completed tasks by updated_at in descending order
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    }
    
    // Sort tasks: tasks with due dates first (sorted by date), then tasks without due dates (ideas)
    const aDate = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
    const bDate = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
    
    if (aDate === Infinity && bDate === Infinity) {
      // If both are ideas (no due date), sort by creation date
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    
    return aDate - bDate;
  });

  // Separate tasks into ideas and active tasks for display
  const ideas = sortedTasks.filter(task => !task.next_due_date);
  const activeTasks = sortedTasks.filter(task => task.next_due_date);

  return (
    <div className="space-y-4">
      {!isHistory && (
        <div className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}
      
      {!sortedTasks?.length ? (
        <div className="text-center text-gray-500 py-8">
          {isHistory 
            ? "No completed tasks yet"
            : "No tasks or ideas yet. Try generating some ideas!"
          }
        </div>
      ) : (
        <div className="space-y-8">
          {activeTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500">Active Tasks</h3>
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <GeneralTaskItem 
                      task={task}
                      isClientTask={!!task.client_id}
                    />
                    {isHistory && task.updated_at && (
                      <div className="absolute top-2 right-2 text-xs text-gray-500">
                        Completed: {format(new Date(task.updated_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isHistory && ideas.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500">Generated Ideas</h3>
              <div className="space-y-4">
                {ideas.map((task) => (
                  <div key={task.id} className="relative">
                    <GeneralTaskItem 
                      task={task}
                      isClientTask={!!task.client_id}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={null}
        onSaved={() => {
          onTasksUpdated();
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};