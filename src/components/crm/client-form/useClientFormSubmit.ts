import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UseClientFormSubmitProps {
  isEditing: boolean;
  onSave?: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
  resetForm: () => void;
}

export const useClientFormSubmit = ({
  isEditing,
  onSave,
  setIsLoading,
  resetForm,
}: UseClientFormSubmitProps) => {
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: any) => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const clientData = {
        name: formData.name,
        type: formData.type,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        status: formData.status || 'prospect',
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        project_revenue: formData.project_revenue ? parseFloat(formData.project_revenue) : null,
        website: formData.website || null,
        notes: formData.notes,
        background: formData.background || null,
        likelihood: formData.likelihood ? parseFloat(formData.likelihood) : null,
        next_due_date: formData.next_due_date || null,
        project_revenue_signed_off: Boolean(formData.project_revenue_signed_off),
        project_revenue_forecast: Boolean(formData.project_revenue_forecast),
        annual_revenue_signed_off: formData.annual_revenue_signed_off ? parseFloat(formData.annual_revenue_signed_off) : 0,
        annual_revenue_forecast: formData.annual_revenue_forecast ? parseFloat(formData.annual_revenue_forecast) : 0,
      };

      console.log('Saving client with form data:', formData);
      console.log('Transformed client data for database:', clientData);

      if (isEditing && onSave) {
        await onSave(clientData);
        toast({
          title: "Success",
          description: "Client information updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientData);

        if (error) throw error;

        // Invalidate all relevant queries to ensure lists are updated
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
        queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });
        queryClient.invalidateQueries({ queryKey: ['priorityNextSteps'] });
        queryClient.invalidateQueries({ queryKey: ['nextSteps'] });

        toast({
          title: "Success",
          description: "Client information saved successfully",
        });
        resetForm();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit };
};