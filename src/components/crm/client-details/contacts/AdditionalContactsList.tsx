import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, X } from 'lucide-react';
import { Contact } from '../ContactInfoCard';

interface AdditionalContactsListProps {
  contacts: Contact[];
  onRemoveContact: (index: number) => void;
}

export const AdditionalContactsList = ({
  contacts,
  onRemoveContact,
}: AdditionalContactsListProps) => {
  return (
    <>
      {contacts.map((contact: Contact, index: number) => (
        <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {`${contact.firstName} ${contact.lastName}` || 'No contact name'}
              </h3>
              <p className="text-sm text-gray-500">{contact.title || 'Title not specified'}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveContact(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail size={14} className="mr-2" />
              {contact.email || 'No email provided'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={14} className="mr-2" />
              {contact.phone || 'No phone provided'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {contact.address || 'No address provided'}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};