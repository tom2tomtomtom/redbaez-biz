import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PrimaryContactFormProps {
  editedName: string;
  editedTitle: string;
  editedSize: string;
  editedEmail: string;
  editedPhone: string;
  editedAddress: string;
  onNameChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PrimaryContactForm = ({
  editedName,
  editedTitle,
  editedSize,
  editedEmail,
  editedPhone,
  editedAddress,
  onNameChange,
  onTitleChange,
  onSizeChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  onSave,
  onCancel,
}: PrimaryContactFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-500">Contact Name</label>
        <Input
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Title</label>
        <Input
          value={editedTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="mt-1"
          placeholder="Enter title"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Company Size</label>
        <Input
          value={editedSize}
          onChange={(e) => onSizeChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Email</label>
        <Input
          type="email"
          value={editedEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Phone</label>
        <Input
          type="tel"
          value={editedPhone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Address</label>
        <Input
          value={editedAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          className="mt-1"
          placeholder="Enter address"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={onSave} className="w-full">
          Save Changes
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