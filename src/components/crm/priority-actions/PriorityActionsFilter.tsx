
import { Category } from './Category';

interface PriorityActionsFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  showCompleted: boolean;
  onShowCompletedChange: (showCompleted: boolean) => void;
}

export const PriorityActionsFilter = ({
  filter,
  onFilterChange,
  showCompleted,
  onShowCompletedChange
}: PriorityActionsFilterProps) => {
  const categories = ['All', 'Marketing', 'Product Development', 'Partnerships', 'Business Admin', 'Client'];

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap gap-2 mr-4">
        {categories.map(category => (
          <Category
            key={category}
            active={filter === category}
            onClick={() => onFilterChange(category)}
            category={category}
          >
            {category}
          </Category>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <Category
          active={showCompleted}
          onClick={() => onShowCompletedChange(!showCompleted)}
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </Category>
      </div>
    </div>
  );
};
