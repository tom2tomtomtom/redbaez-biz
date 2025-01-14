import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ClientFormData, UseClientFormSubmitProps } from './types';

export const useClientFormSubmit = ({ clientId, onSuccess }: UseClientFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: ClientFormData) => {
    console.log('Submitting form data:', formData);
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

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
        annual_revenue: formData.annual_revenue,
        website: formData.website,
        notes: formData.notes,
        status: formData.status || 'incomplete',
        likelihood: formData.likelihood,
        background: formData.background,
        project_revenue: formData.project_revenue,
        next_due_date: formData.next_due_date,
        project_revenue_signed_off: formData.project_revenue_signed_off,
        project_revenue_forecast: formData.project_revenue_forecast,
        annual_revenue_signed_off: formData.annual_revenue_signed_off || 0,
        annual_revenue_forecast: formData.annual_revenue_forecast || 0,
      };

      console.log('Prepared client data:', clientData);

      if (clientId) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', parseInt(clientId, 10));

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client information updated successfully",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.log('Inserting new client');
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (error) {
          console.error('Error inserting client:', error);
          throw error;
        }

        console.log('New client created:', newClient);

        // Create next step if notes and due date are provided
        if (formData.notes && formData.next_due_date && newClient) {
          console.log('Creating next step for client:', newClient.id);
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

        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
        queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });
        queryClient.invalidateQueries({ queryKey: ['next-steps-history'] });

        if (onSuccess) {
          console.log('Calling onSuccess callback');
          onSuccess();
        }

        if (newClient) {
          console.log('Navigating to client page:', newClient.id);
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