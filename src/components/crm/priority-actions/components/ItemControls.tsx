import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PriorityItem } from '../hooks/usePriorityData';

interface ItemControlsProps {
  item: PriorityItem;
  onComplete?: (item: PriorityItem) => void;
  onUrgentChange?: (item: PriorityItem, urgent: boolean) => void;
}

export const ItemControls = ({ 
  item, 
  onComplete, 
  onUrgentChange 
}: ItemControlsProps) => {
  const isCompleted = item.type === 'task' 
    ? (item.data as any).status === 'completed'
    : (item.data as any).completed_at !== null;

  const handleUrgentChange = async (checked: boolean) => {
    // Add a small delay to allow the toggle animation to complete
    setTimeout(() => {
      onUrgentChange?.(item, checked);
    }, 150);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={item.data.urgent}
        onCheckedChange={handleUrgentChange}
      />
      {onComplete && !isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onComplete(item)}
          className="h-6 w-6"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};