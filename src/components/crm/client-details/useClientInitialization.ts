import { useState, useEffect } from 'react';
import { Contact } from './ContactInfoCard';

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
        title: '',
        email: clientData.contact_email || '',
        address: '',
        phone: clientData.contact_phone || ''
      };

      // Initialize additional contacts from the JSONB field
      const additionalContacts = clientData.additional_contacts || [];
      console.log('Loading additional contacts:', additionalContacts);

      // Combine primary contact with any additional contacts
      const allContacts = [
        primaryContact,
        ...additionalContacts.map((contact: any) => ({
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          title: contact.title || '',
          email: contact.email || '',
          address: contact.address || '',
          phone: contact.phone || ''
        }))
      ];

      console.log('Setting all contacts:', allContacts);
      setContacts(allContacts);
    }
  }, [clientData]);

  return { contacts, setContacts };
};