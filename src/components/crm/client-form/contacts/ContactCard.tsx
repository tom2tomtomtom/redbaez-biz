import React from 'react';
import { Button } from '@/components/ui/button';
import { ContactField } from './ContactField';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface ContactCardProps {
  contact: Contact;
  onContactChange: (field: keyof Contact, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const ContactCard = ({
  contact,
  onContactChange,
  onRemove,
  canRemove
}: ContactCardProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactField 
          placeholder="First Name"
          value={contact.firstName}
          onChange={(value) => onContactChange('firstName', value)}
        />
        <ContactField 
          placeholder="Last Name"
          value={contact.lastName}
          onChange={(value) => onContactChange('lastName', value)}
        />
      </div>
      
      <ContactField 
        placeholder="Title/Position"
        value={contact.title}
        onChange={(value) => onContactChange('title', value)}
      />
      
      <ContactField 
        placeholder="Email Address"
        type="email"
        value={contact.email}
        onChange={(value) => onContactChange('email', value)}
      />
      
      <ContactField 
        placeholder="Address"
        value={contact.address}
        onChange={(value) => onContactChange('address', value)}
      />
      
      <ContactField 
        placeholder="Phone Number"
        type="tel"
        value={contact.phone}
        onChange={(value) => onContactChange('phone', value)}
      />
      
      {canRemove && (
        <Button 
          variant="destructive"
          onClick={onRemove}
          className="w-full transition-all duration-300"
        >
          Remove Contact
        </Button>
      )}
    </div>
  );
};