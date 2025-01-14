import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ClientFormData } from '../types';
import { toast } from '@/components/ui/use-toast';

export const useClientMutation = (clientId?: number) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createClient = async (formData: ClientFormData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: formData.name,
        type: formData.type || 'prospect',
        industry: formData.industry,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        company_size: formData.company_size,
        website: formData.website,
        notes: formData.notes,
        status: formData.status,
        background: formData.background,
        project_revenue: formData.project_revenue,
        annual_revenue: formData.annual_revenue,
        project_revenue_signed_off: formData.project_revenue_signed_off,
        project_revenue_forecast: formData.project_revenue_forecast,
        annual_revenue_signed_off: formData.annual_revenue_signed_off,
        annual_revenue_forecast: formData.annual_revenue_forecast,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw new Error(error.message);
    }

    return data;
  };

  const createNextStep = async (clientId: number, notes: string, dueDate: string) => {
    const { error } = await supabase
      .from('client_next_steps')
      .insert({
        client_id: clientId,
        notes: notes,
        due_date: dueDate,
        urgent: false,
        category: 'general' // Default to general category
      });

    if (error) {
      console.error('Error creating next step:', error);
      throw new Error(error.message);
    }
  };

  const updateClient = async (formData: ClientFormData) => {
    if (!clientId) return;

    const { error } = await supabase
      .from('clients')
      .update({
        name: formData.name,
        type: formData.type,
        industry: formData.industry,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        company_size: formData.company_size,
        website: formData.website,
        notes: formData.notes,
        status: formData.status,
        background: formData.background,
        project_revenue: formData.project_revenue,
        annual_revenue: formData.annual_revenue,
        project_revenue_signed_off: formData.project_revenue_signed_off,
        project_revenue_forecast: formData.project_revenue_forecast,
        annual_revenue_signed_off: formData.annual_revenue_signed_off,
        annual_revenue_forecast: formData.annual_revenue_forecast,
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error updating client:', error);
      throw new Error(error.message);
    }
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['client'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
  };

  return {
    isSubmitting,
    setIsSubmitting,
    createClient,
    updateClient,
    createNextStep,
    invalidateQueries,
    navigate
  };
};