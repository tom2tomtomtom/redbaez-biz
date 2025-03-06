
import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { useState } from "react";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";

export const BusinessAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const queryClient = useQueryClient();

  const handleTaskSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task: GeneralTaskRow) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Business Administration</h1>
        </div>
        
        <div className="grid gap-6">
          <PriorityActions 
            hideAddButton={false}
            initialCategory="Business Admin"
            onTaskClick={handleTaskClick}
          />
        </div>

        <TaskDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={editingTask}
          onSaved={handleTaskSaved}
          defaultCategory="Business Admin"
        />
      </div>
    </div>
  );
};
