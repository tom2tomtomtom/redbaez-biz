
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  category?: string;
}

export const Category = ({ active = false, onClick, children, category }: CategoryProps) => {
  const getCategoryColorClasses = (category: string | undefined, isActive: boolean) => {
    if (!category) return '';
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower === 'business admin') {
      return isActive ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    }
    
    if (categoryLower === 'marketing') {
      return isActive ? 'bg-[#F0D4FA] text-purple-800 hover:bg-[#F0D4FA]/90' : 'bg-[#F0D4FA]/30 hover:bg-[#F0D4FA]/50 text-purple-700';
    }
    
    if (categoryLower === 'product development') {
      return isActive ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : 'bg-blue-100/50 hover:bg-blue-100 text-blue-700';
    }
    
    if (categoryLower === 'partnerships') {
      return isActive ? 'bg-green-200 text-green-800 hover:bg-green-300' : 'bg-green-100/50 hover:bg-green-100 text-green-700';
    }

    if (categoryLower === 'client') {
      return isActive ? 'bg-[#FEC6A1] text-orange-800 hover:bg-[#FEC6A1]/90' : 'bg-[#FEC6A1]/30 hover:bg-[#FEC6A1]/50 text-orange-700';
    }
    
    return '';
  };

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 transition-colors font-medium",
        getCategoryColorClasses(category?.toString() || children?.toString(), active)
      )}
    >
      {children}
    </Button>
  );
};
