import { useState, useEffect } from 'react';
import { Contact } from './ContactInfoCard';

export const useClientInitialization = (client: any) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      address: '',
      phone: ''
    }
  ]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  useEffect(() => {
    if (client) {
      // Initialize contacts from client data
      if (client.contact_name || client.contact_email || client.contact_phone) {
        const [firstName = '', lastName = ''] = (client.contact_name || '').split(' ');
        const primaryContact = {
          firstName,
          lastName,
          title: '',
          email: client.contact_email || '',
          address: '',
          phone: client.contact_phone || ''
        };

        const additionalContacts = client.additional_contacts || [];
        setContacts([primaryContact, ...additionalContacts]);
      }

      // Initialize next steps and due date
      setNextSteps(client.notes || '');
      if (client.next_due_date) {
        // Format the date to YYYY-MM-DD for the input field
        const date = new Date(client.next_due_date);
        const formattedDate = date.toISOString().split('T')[0];
        setNextDueDate(formattedDate);
      }
    }
  }, [client]);

  return { 
    contacts, 
    setContacts,
    nextSteps,
    setNextSteps,
    nextDueDate,
    setNextDueDate
  };
};