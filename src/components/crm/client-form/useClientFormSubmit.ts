import { ClientFormData, UseClientFormSubmitProps } from './types';
import { useClientValidation } from './hooks/useClientValidation';
import { useClientMutation } from './hooks/useClientMutation';
import { toast } from '@/components/ui/use-toast';

export const useClientFormSubmit = ({ clientId, onSuccess }: UseClientFormSubmitProps) => {
  const { validateForm } = useClientValidation();
  const { 
    isSubmitting,
    setIsSubmitting,
    createClient,
    updateClient,
    createNextStep,
    invalidateQueries,
    navigate
  } = useClientMutation(clientId ? parseInt(clientId) : undefined);

  const handleSubmit = async (formData: ClientFormData) => {
    console.log('Submitting form data:', formData);
    
    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (clientId) {
        await updateClient(formData);
        toast({
          title: "Success",
          description: "Client information updated successfully",
        });
      } else {
        const newClient = await createClient(formData);
        console.log('New client created:', newClient);

        if (newClient) {
          await createNextStep(newClient.id, formData.notes!, formData.next_due_date!);
          invalidateQueries();
          navigate(`/client/${newClient.id}`);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save client information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};