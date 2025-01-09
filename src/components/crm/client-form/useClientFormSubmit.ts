import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useClientFormSubmit = (clientId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const clientData = {
        name: formData.name,
        type: formData.type || 'business',
        industry: formData.industry,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        company_size: formData.company_size,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        website: formData.website,
        notes: formData.notes,
        status: formData.status || 'incomplete',
        likelihood: formData.likelihood ? parseFloat(formData.likelihood) : null,
        background: formData.background,
        project_revenue: formData.project_revenue ? parseFloat(formData.project_revenue) : null,
        next_due_date: formData.next_due_date || null,
      };

      if (clientId) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', clientId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client information updated successfully",
        });
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (error) throw error;

        // Create next step if notes and due date are provided
        if (formData.notes && formData.next_due_date && newClient) {
          const { error: nextStepError } = await supabase
            .from('client_next_steps')
            .insert({
              client_id: newClient.id,
              notes: formData.notes,
              due_date: formData.next_due_date,
              urgent: false
            });

          if (nextStepError) {
            console.error('Error creating next step:', nextStepError);
          }
        }

        // Invalidate all relevant queries to ensure lists are updated
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
        queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });
        queryClient.invalidateQueries({ queryKey: ['next-steps-history'] });

        toast({
          title: "Success",
          description: "New client added successfully",
        });

        // Navigate to the new client's page
        if (newClient) {
          navigate(`/client/${newClient.id}`);
        }
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