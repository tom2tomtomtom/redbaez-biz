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

      console.log('Starting update with all data:', { formData, contacts });

      // Get the primary contact from the contacts array
      const primaryContact = contacts[0];
      console.log('Primary contact:', primaryContact);

      // Get additional contacts (all contacts except the primary one)
      const additionalContacts = contacts.slice(1);
      console.log('Additional contacts:', additionalContacts);

      // Prepare the update data with all information
      const dataToUpdate = {
        ...formData,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: additionalContacts.length > 0 ? additionalContacts : null
      };

      console.log('Final data to update:', dataToUpdate);
      
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
        description: "Failed to update client information. Please try again.",
        variant: "destructive",
      });
    },
  });
};