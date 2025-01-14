import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskItem } from '../GeneralTaskItem';
import { NextStepItem } from '../NextStepItem';
import { ItemControls } from './ItemControls';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { useNavigate } from 'react-router-dom';

interface PriorityListItemProps {
  item: PriorityItem;
  index: number;
  onTaskClick: (task: GeneralTaskRow) => void;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const PriorityListItem = ({
  item,
  index,
  onTaskClick,
  onComplete,
  onUrgentChange,
  onDelete
}: PriorityListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.type === 'task') {
      if (item.data.client_id) {
        navigate(`/client/${item.data.client_id}`);
      } else {
        onTaskClick(item.data);
      }
    } else if (item.data.client_id) {
      navigate(`/client/${item.data.client_id}`);
    }
  };

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
        onDelete={onDelete}
      />
      <div 
        className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg cursor-pointer"
        onClick={handleClick}
      >
        {item.type === 'task' ? (
          <GeneralTaskItem task={item.data} />
        ) : (
          <NextStepItem nextStep={item.data} />
        )}
      </div>
    </div>
  );
};