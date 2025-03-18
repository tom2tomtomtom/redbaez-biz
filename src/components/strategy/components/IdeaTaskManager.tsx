
import { useState } from "react";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { CreateTaskDialog } from "./CreateTaskDialog";

interface IdeaTaskManagerProps {
  category: string;
  onTaskSaved: () => void;
}

export const IdeaTaskManager = ({ category, onTaskSaved }: IdeaTaskManagerProps) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<{
    suggestion: string;
    priority: string;
    type: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleCreateTask = (idea: { suggestion: string; priority: string; type: string }) => {
    setSelectedIdea(idea);
    setShowConfirmDialog(true);
  };

  return (
    <>
      <CreateTaskDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={() => {
          setShowConfirmDialog(false);
          setIsTaskDialogOpen(true);
        }}
      />

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedIdea ? {
          id: '',
          title: selectedIdea.suggestion,
          description: `Type: ${selectedIdea.type}\nPriority: ${selectedIdea.priority}`,
          category: category,
          status: 'incomplete',
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          urgent: false,
          client_id: null,
          updated_by: null,
          created_by: null,
          type: 'task'
        } : null}
        onSaved={() => {
          setIsTaskDialogOpen(false);
          onTaskSaved();
        }}
      />
    </>
  );
};
