
import { useState } from "react";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskPriority } from "@/types/task";

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

  const mapPriority = (priority: string): TaskPriority => {
    const normalized = priority.toLowerCase();
    if (normalized === 'urgent') return 'urgent';
    if (normalized === 'high') return 'high';
    if (normalized === 'low') return 'low';
    return 'normal';
  };

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
          status: 'pending',
          due_date: null, // Initially null - when a due date is added, it will appear in Priority Actions
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          priority: mapPriority(selectedIdea.priority),
          urgent: mapPriority(selectedIdea.priority) === 'urgent',
          client_id: null,
          updated_by: null,
          created_by: null,
          notes: null,
          next_due_date: null
        } : null}
        onSaved={() => {
          setIsTaskDialogOpen(false);
          onTaskSaved();
        }}
      />
    </>
  );
};
