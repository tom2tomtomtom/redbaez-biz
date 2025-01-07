import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

export const useClientUpdate = (id: string | undefined, onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: { formData: any; contacts: Contact[] }) => {
      if (!id) throw new Error('Client ID is required');

      // Get the primary contact from the contacts array
      const primaryContact = contacts[0];
      console.log('Primary contact for update:', primaryContact);

      // Prepare the update data with contact information
      const dataToUpdate = {
        ...formData,
        contact_name: primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}`.trim() : null,
        contact_email: primaryContact?.email || null,
        contact_phone: primaryContact?.phone || null,
        // Store additional contacts as JSONB
        additional_contacts: contacts.length > 1 
          ? contacts.slice(1)  // Store only additional contacts, not the primary one
          : null
      };

      console.log('Updating client with data:', dataToUpdate);
      
      const { data, error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
      
      console.log('Update response:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      toast({
        title: "Success",
        description: "Client information updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error in update mutation:', error);
      toast({
        title: "Error",
        description: "Failed to update client information. Please check the console for details.",
        variant: "destructive",
      });
    },
  });
};