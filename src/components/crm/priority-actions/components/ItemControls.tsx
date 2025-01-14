import { Switch } from "@/components/ui/switch";
import { CheckCircle, Trash2 } from "lucide-react";
import { PriorityItem } from "../hooks/usePriorityData";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItemControlsProps {
  item: PriorityItem;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const ItemControls = ({ 
  item, 
  onComplete, 
  onUrgentChange,
  onDelete
}: ItemControlsProps) => {
  const isCompleted = item.type === 'next_step' 
    ? item.data.completed_at !== null
    : item.data.status === 'completed';

  const handleUrgentChange = async (checked: boolean) => {
    setTimeout(() => {
      onUrgentChange(checked);
    }, 300);
  };

  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
      <div className="flex items-center gap-2">
        <button
          onClick={onComplete}
          className={cn(
            "transition-all duration-300 transform hover:scale-110 active:scale-95",
            isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <CheckCircle className={cn(
            "h-5 w-5 transition-all duration-300",
            isCompleted ? 'animate-scale-in' : ''
          )} />
        </button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="transition-all duration-300 transform hover:scale-110 active:scale-95 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {item.type === 'task' ? 'task' : 'next step'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="transition-transform duration-300 hover:scale-105">
          <Switch
            id={`urgent-${item.data.id}`}
            checked={'urgent' in item.data ? item.data.urgent : false}
            onCheckedChange={handleUrgentChange}
            className="transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
};