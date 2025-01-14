import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskItem } from '../GeneralTaskItem';
import { NextStepItem } from '../NextStepItem';
import { ItemControls } from './ItemControls';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';

interface PriorityListItemProps {
  item: PriorityItem;
  index: number;
  onTaskClick: (task: GeneralTaskRow) => void;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
}

export const PriorityListItem = ({
  item,
  index,
  onTaskClick,
  onComplete,
  onUrgentChange
}: PriorityListItemProps) => {
  return (
    <div 
      className="relative transition-all duration-500 transform animate-fade-in"
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <ItemControls
        item={item}
        onComplete={onComplete}
        onUrgentChange={onUrgentChange}
      />
      <div className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg">
        {item.type === 'task' ? (
          <div 
            onClick={() => onTaskClick(item.data)}
            className="cursor-pointer"
          >
            <GeneralTaskItem task={item.data} />
          </div>
        ) : (
          <NextStepItem nextStep={item.data} />
        )}
      </div>
    </div>
  );
};