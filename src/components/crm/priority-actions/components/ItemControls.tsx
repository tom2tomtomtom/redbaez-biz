import { Switch } from "@/components/ui/switch";
import { CheckCircle } from "lucide-react";
import { PriorityItem } from "../hooks/usePriorityData";

interface ItemControlsProps {
  item: PriorityItem;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
}

export const ItemControls = ({ 
  item, 
  onComplete, 
  onUrgentChange 
}: ItemControlsProps) => {
  const isCompleted = item.type === 'next_step' 
    ? item.data.completed_at !== null
    : item.data.status === 'completed';

  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
      <div className="flex items-center gap-2">
        <button
          onClick={onComplete}
          className={`transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CheckCircle className={`h-5 w-5 transition-all duration-300 ${
            isCompleted ? 'animate-scale-in' : ''
          }`} />
        </button>
        <Switch
          id={`urgent-${item.data.id}`}
          checked={'urgent' in item.data ? item.data.urgent : false}
          onCheckedChange={onUrgentChange}
        />
      </div>
    </div>
  );
};