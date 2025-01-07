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

      console.log('Starting client update with:', { formData, contacts });

      // Separate primary contact and additional contacts
      const [primaryContact, ...additionalContacts] = contacts;
      
      if (!primaryContact) {
        throw new Error('At least one primary contact is required');
      }

      // Prepare the update data
      const dataToUpdate = {
        ...formData,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        // Store additional contacts as a proper JSONB array
        additional_contacts: additionalContacts.length > 0 ? additionalContacts.slice(0, 5) : null
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
      
      console.log('Update successful:', data);
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