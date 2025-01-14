import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ClientFormData } from '../types';

export const useClientMutation = (clientId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createClient = async (formData: ClientFormData) => {
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert(formData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting client:', error);
      throw error;
    }

    return newClient;
  };

  const updateClient = async (formData: ClientFormData) => {
    const { error } = await supabase
      .from('clients')
      .update(formData)
      .eq('id', parseInt(clientId!, 10));

    if (error) throw error;
  };

  const createNextStep = async (clientId: number, notes: string, dueDate: string) => {
    if (notes && dueDate) {
      const { error: nextStepError } = await supabase
        .from('client_next_steps')
        .insert({
          client_id: clientId,
          notes: notes,
          due_date: dueDate,
          urgent: false
        });

      if (nextStepError) {
        console.error('Error creating next step:', nextStepError);
      }
    }
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
    queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });
    queryClient.invalidateQueries({ queryKey: ['next-steps-history'] });
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