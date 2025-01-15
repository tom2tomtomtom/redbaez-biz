import React from 'react';
import { Mail, Phone, Star } from 'lucide-react';

interface PrimaryContactViewProps {
  contactName: string | null;
  title: string;
  companySize: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string;
}

export const PrimaryContactView = ({
  contactName,
  title,
  companySize,
  contactEmail,
  contactPhone,
  address,
}: PrimaryContactViewProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">{contactName || 'No contact name'}</h3>
      <p className="text-sm text-gray-500">{title || 'Title not specified'}</p>
      <p className="text-sm text-gray-500">{companySize || 'Company size not specified'}</p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={14} className="mr-2" />
          {contactEmail || 'No email provided'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={14} className="mr-2" />
          {contactPhone || 'No phone provided'}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {address || 'No address provided'}
        </p>
      </div>
    </div>
  );
};