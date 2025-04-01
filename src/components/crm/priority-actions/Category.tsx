
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CategoryProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  category?: string;
}

export const Category = ({
  active = false,
  children,
  onClick,
  category
}: CategoryProps) => {
  // Map category names to colors
  const getCategoryColor = (category?: string) => {
    if (!category || category === 'All') return 'bg-gray-100 hover:bg-gray-200';
    
    switch (category) {
      case 'Marketing':
        return 'bg-purple-100 hover:bg-purple-200';
      case 'Product Development':
        return 'bg-blue-100 hover:bg-blue-200';
      case 'Partnerships':
        return 'bg-green-100 hover:bg-green-200';
      case 'Business Admin':
        return 'bg-gray-100 hover:bg-gray-200';
      case 'Client':
        return 'bg-orange-100 hover:bg-orange-200';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-sm rounded-full transition-colors',
        getCategoryColor(category),
        active ? 'ring-2 ring-primary/50' : ''
      )}
    >
      {children}
    </button>
  );
};
