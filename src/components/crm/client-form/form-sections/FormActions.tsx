import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const FormActions = ({
  onCancel,
  onSubmit,
  isSubmitting,
  isEditing,
}: FormActionsProps) => {
  return (
    <div className="mt-6 border-t pt-6 flex gap-4">
      {onCancel && (
        <Button 
          variant="outline"
          className="w-full py-6 text-lg font-medium"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      <Button 
        className="w-full py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.01]"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : isEditing ? 'Update Client Information' : 'Save Client Information'}
      </Button>
    </div>
  );
};