import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

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
        company_size: formData.companySize || null,
        status: formData.status || 'prospect',
        annual_revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        project_revenue: formData.projectRevenue ? parseFloat(formData.projectRevenue) : null,
        website: formData.website || null,
        notes: formData.notes,
        background: formData.background || null,
        likelihood: formData.likelihood ? parseFloat(formData.likelihood) : null,
        next_due_date: formData.nextDueDate || null,
        project_revenue_signed_off: formData.projectRevenueSignedOff || false,
        project_revenue_forecast: formData.projectRevenueForecast || false,
        annual_revenue_signed_off: formData.annualRevenueSignedOff ? parseFloat(formData.annualRevenueSignedOff) : 0,
        annual_revenue_forecast: formData.annualRevenueForecast ? parseFloat(formData.annualRevenueForecast) : 0,
      };

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