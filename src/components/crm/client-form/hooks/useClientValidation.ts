import { toast } from '@/components/ui/use-toast';
import { ClientFormData } from '../types';

export const useClientValidation = () => {
  const validateForm = (formData: ClientFormData): boolean => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return { validateForm };
};