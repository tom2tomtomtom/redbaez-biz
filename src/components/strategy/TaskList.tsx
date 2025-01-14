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
    // Match the same filtering logic as the priority list
    return task.status !== 'completed' && task.next_due_date !== null;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (isHistory) {
      // Sort completed tasks by updated_at in descending order
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    }
    // Sort active tasks by next_due_date in ascending order
    const aDate = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
    const bDate = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
    return aDate - bDate;
  });

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
            : "No active tasks. Try creating a new task!"
          }
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
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