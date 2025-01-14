import { useState } from "react";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { GeneralTaskItem } from "../crm/priority-actions/GeneralTaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "../crm/priority-actions/TaskDialog";

interface TaskListProps {
  tasks: GeneralTaskRow[];
  isLoading: boolean;
  onTasksUpdated: () => void;
}

export const TaskList = ({ tasks, isLoading, onTasksUpdated }: TaskListProps) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
      
      {!tasks?.length ? (
        <div className="text-center text-gray-500 py-8">
          No tasks generated yet. Try generating some ideas!
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <GeneralTaskItem 
              key={task.id} 
              task={task}
              isClientTask={!!task.client_id}
            />
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