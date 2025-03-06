
import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Category = ({ active = false, onClick, children }: CategoryProps) => {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="h-8 transition-colors"
    >
      {children}
    </Button>
  );
};
