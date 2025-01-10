import { useState } from "react";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { GeneralTaskItem } from "../crm/priority-actions/GeneralTaskItem";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  tasks: GeneralTaskRow[];
  isLoading: boolean;
  onTasksUpdated: () => void;
}

export const TaskList = ({ tasks, isLoading, onTasksUpdated }: TaskListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No tasks generated yet. Try generating some ideas!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <GeneralTaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};