import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
        <div key={index} className="space-y-4 p-4 border rounded-lg bg-background/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="First Name"
              value={contact.firstName}
              onChange={(e) => handleContactChange(index, 'firstName', e.target.value)}
              className="transition-all duration-300"
            />
            <Input 
              placeholder="Last Name"
              value={contact.lastName}
              onChange={(e) => handleContactChange(index, 'lastName', e.target.value)}
              className="transition-all duration-300"
            />
          </div>
          
          <Input 
            placeholder="Title/Position"
            value={contact.title}
            onChange={(e) => handleContactChange(index, 'title', e.target.value)}
            className="transition-all duration-300"
          />
          
          <Input 
            placeholder="Email Address"
            type="email"
            value={contact.email}
            onChange={(e) => handleContactChange(index, 'email', e.target.value)}
            className="transition-all duration-300"
          />
          
          <Input 
            placeholder="Address"
            value={contact.address}
            onChange={(e) => handleContactChange(index, 'address', e.target.value)}
            className="transition-all duration-300"
          />
          
          <Input 
            placeholder="Phone Number"
            type="tel"
            value={contact.phone}
            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
            className="transition-all duration-300"
          />
          
          <Button 
            variant="destructive"
            onClick={() => removeContact(index)}
            className="w-full transition-all duration-300"
          >
            Remove Contact
          </Button>
        </div>
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