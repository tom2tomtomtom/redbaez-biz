import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PriorityItem } from "../hooks/usePriorityData";

interface CompletionDialogProps {
  itemToComplete: PriorityItem | null;
  onOpenChange: (open: boolean) => void;
  onComplete: (item: PriorityItem) => void;
}

export const CompletionDialog = ({
  itemToComplete,
  onOpenChange,
  onComplete,
}: CompletionDialogProps) => {
  return (
    <AlertDialog 
      open={!!itemToComplete} 
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark this task as completed? It will be removed from your task list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => itemToComplete && onComplete(itemToComplete)}
          >
            Complete Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};