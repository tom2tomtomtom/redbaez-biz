import { useState, useEffect } from 'react';
import { Contact } from './ContactInfoCard';

export const useClientInitialization = (client: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  useEffect(() => {
    if (client) {
      // Initialize contacts
      const primaryContact: Contact = {
        firstName: client.contact_name?.split(' ')[0] || '',
        lastName: client.contact_name?.split(' ').slice(1).join(' ') || '',
        title: '',
        email: client.contact_email || '',
        address: '',
        phone: client.contact_phone || ''
      };

      const additionalContacts: Contact[] = client.additional_contacts || [];
      setContacts([primaryContact, ...additionalContacts]);

      // Initialize next steps from notes field, maintaining existing value if present
      setNextSteps(client.notes || nextSteps);

      // Initialize next due date and format it properly, maintaining existing value if present
      if (client.next_due_date) {
        const date = new Date(client.next_due_date);
        const formattedDate = date.toISOString().split('T')[0];
        setNextDueDate(formattedDate);
      } else {
        // Keep the existing value if no new value is provided
        setNextDueDate(nextDueDate);
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
