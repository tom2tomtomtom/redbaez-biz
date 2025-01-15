import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Contact } from '../ContactInfoCard';

interface NewContactFormProps {
  newContact: Contact;
  onContactChange: (contact: Contact) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export const NewContactForm = ({
  newContact,
  onContactChange,
  onAdd,
  onCancel,
}: NewContactFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 mb-4">Add New Contact</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-gray-500">First Name*</label>
          <Input
            value={newContact.firstName}
            onChange={(e) => onContactChange({...newContact, firstName: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Last Name*</label>
          <Input
            value={newContact.lastName}
            onChange={(e) => onContactChange({...newContact, lastName: e.target.value})}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-500">Title</label>
        <Input
          value={newContact.title}
          onChange={(e) => onContactChange({...newContact, title: e.target.value})}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Email</label>
        <Input
          type="email"
          value={newContact.email}
          onChange={(e) => onContactChange({...newContact, email: e.target.value})}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Phone</label>
        <Input
          type="tel"
          value={newContact.phone}
          onChange={(e) => onContactChange({...newContact, phone: e.target.value})}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Address</label>
        <Input
          value={newContact.address}
          onChange={(e) => onContactChange({...newContact, address: e.target.value})}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onAdd} className="w-full">
          Add Contact
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};