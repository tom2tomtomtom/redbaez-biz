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
      console.log('Initializing contacts with client data:', clientData);
      
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

      // Get additional contacts from the database
      let additionalContacts: Contact[] = [];
      if (clientData.additional_contacts) {
        try {
          // Handle both string and array formats
          const parsedContacts = typeof clientData.additional_contacts === 'string'
            ? JSON.parse(clientData.additional_contacts)
            : clientData.additional_contacts;

          if (Array.isArray(parsedContacts)) {
            additionalContacts = parsedContacts.map((contact: any): Contact => ({
              firstName: contact.firstName || '',
              lastName: contact.lastName || '',
              title: contact.title || '',
              email: contact.email || '',
              address: contact.address || '',
              phone: contact.phone || ''
            }));
          }
          
          console.log('Parsed additional contacts:', additionalContacts);
        } catch (error) {
          console.error('Error parsing additional contacts:', error);
        }
      }

      // Combine primary and additional contacts (up to 5 additional)
      const allContacts = [primaryContact, ...additionalContacts.slice(0, 5)];
      console.log('Setting all contacts:', allContacts);
      setContacts(allContacts);
    }
  }, [clientData]);

  return { contacts, setContacts };
};