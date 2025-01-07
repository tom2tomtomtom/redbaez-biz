import { useState, useEffect } from 'react';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

export const useClientInitialization = (clientData: any) => {
  const [contacts, setContacts] = useState<Contact[]>([{ 
    firstName: '', 
    lastName: '', 
    title: '', 
    email: '', 
    address: '', 
    phone: '' 
  }]);
  
  useEffect(() => {
    if (clientData) {
      console.log('Initializing client data:', clientData);
      
      // Initialize primary contact from main client fields
      const [firstName = '', lastName = ''] = (clientData.contact_name || '').split(' ');
      const primaryContact: Contact = {
        firstName,
        lastName,
        title: clientData.contact_title || '',
        email: clientData.contact_email || '',
        address: clientData.contact_address || '',
        phone: clientData.contact_phone || ''
      };

      setContacts([primaryContact]);
    }
  }, [clientData]);

  return { contacts, setContacts };
};