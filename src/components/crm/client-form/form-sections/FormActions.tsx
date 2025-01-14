import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="mt-6 border-t pt-6 flex gap-4">
      <Button 
        variant="outline"
        className="w-full py-6 text-lg font-medium"
        onClick={handleCancel}
      >
        Cancel
      </Button>
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