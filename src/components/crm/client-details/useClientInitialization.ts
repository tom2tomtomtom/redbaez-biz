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
      // Initialize primary contact
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
      const additionalContacts: Contact[] = 
        Array.isArray(clientData.additional_contacts) 
          ? clientData.additional_contacts.map((contact: any): Contact => ({
              firstName: contact.firstName || '',
              lastName: contact.lastName || '',
              title: contact.title || '',
              email: contact.email || '',
              address: contact.address || '',
              phone: contact.phone || ''
            }))
          : [];

      // Combine primary and additional contacts
      setContacts([primaryContact, ...additionalContacts]);
    }
  }, [clientData]);

  return { contacts, setContacts };
};