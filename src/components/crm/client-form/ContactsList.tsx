import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContactCard } from './contacts/ContactCard';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface ContactsListProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
}

export const ContactsList = ({ contacts, onContactsChange }: ContactsListProps) => {
  const addContact = () => {
    onContactsChange([...contacts, { 
      firstName: '', 
      lastName: '', 
      title: '', 
      email: '', 
      address: '', 
      phone: '' 
    }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      onContactsChange(contacts.filter((_, i) => i !== index));
    }
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onContactsChange(newContacts);
  };

  return (
    <div className="space-y-6">
      {contacts.map((contact, index) => (
        <ContactCard
          key={index}
          contact={contact}
          onContactChange={(field, value) => handleContactChange(index, field, value)}
          onRemove={() => removeContact(index)}
          canRemove={contacts.length > 1}
        />
      ))}
      <Button 
        variant="outline" 
        onClick={addContact}
        className="w-full transition-all duration-300"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Contact
      </Button>
    </div>
  );
};