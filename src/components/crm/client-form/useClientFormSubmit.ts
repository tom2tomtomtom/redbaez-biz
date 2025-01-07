import { toast } from "@/components/ui/toast";
import { supabase } from "@/integrations/supabase/client";

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
        // Ensure all revenue fields are properly mapped and converted to numbers
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        project_revenue: formData.project_revenue ? parseFloat(formData.project_revenue) : null,
        website: formData.website || null,
        notes: formData.notes,
        background: formData.background || null,
        likelihood: formData.likelihood ? parseFloat(formData.likelihood) : null,
        next_due_date: formData.next_due_date || null,
        // Ensure boolean fields are properly converted
        project_revenue_signed_off: Boolean(formData.project_revenue_signed_off),
        project_revenue_forecast: Boolean(formData.project_revenue_forecast),
        // Ensure numeric fields are properly converted with fallback to 0
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