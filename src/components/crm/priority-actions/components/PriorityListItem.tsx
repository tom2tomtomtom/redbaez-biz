import { GeneralTaskItem } from '../GeneralTaskItem';
import { NextStepItem } from '../NextStepItem';
import { ItemControls } from './ItemControls';
import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { ClientNextStepRow } from '@/integrations/supabase/types/client-next-steps.types';

interface PriorityListItemProps {
  item: PriorityItem;
  onTaskClick?: (task: GeneralTaskRow) => void;
  onComplete?: (item: PriorityItem) => void;
  onUrgentChange?: (item: PriorityItem, urgent: boolean) => void;
}

export const PriorityListItem = ({
  item,
  onTaskClick,
  onComplete,
  onUrgentChange
}: PriorityListItemProps) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-grow">
        <div className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg">
          {item.type === 'task' ? (
            <div 
              onClick={() => onTaskClick?.(item.data as GeneralTaskRow)}
              className="cursor-pointer"
            >
              <GeneralTaskItem task={item.data as GeneralTaskRow} />
            </div>
          ) : (
            <NextStepItem nextStep={item.data as ClientNextStepRow & { client_name?: string }} />
          )}
        </div>
      </div>
      <ItemControls
        item={item}
        onComplete={onComplete}
        onUrgentChange={onUrgentChange}
      />
    </div>
  );
};