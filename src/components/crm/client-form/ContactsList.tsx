import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Contact {
  name: string;
  title: string;
}

interface ContactsListProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
}

export const ContactsList = ({ contacts, onContactsChange }: ContactsListProps) => {
  const addContact = () => {
    onContactsChange([...contacts, { name: '', title: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      onContactsChange(contacts.filter((_, i) => i !== index));
    }
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onContactsChange(newContacts);
  };

  return (
    <div className="space-y-4">
      {contacts.map((contact, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input 
            placeholder="Contact Name"
            value={contact.name}
            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
            className="transition-all duration-300"
          />
          <Input 
            placeholder="Title"
            value={contact.title}
            onChange={(e) => handleContactChange(index, 'title', e.target.value)}
            className="transition-all duration-300"
          />
          <Button 
            variant="destructive"
            onClick={() => removeContact(index)}
            className="transition-all duration-300"
          >
            Remove
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