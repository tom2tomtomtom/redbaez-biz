import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientUpdate } from './useClientUpdate';
import { toast } from '@/components/ui/use-toast';
import { PrimaryContactForm } from './contacts/PrimaryContactForm';
import { PrimaryContactView } from './contacts/PrimaryContactView';
import { NewContactForm } from './contacts/NewContactForm';
import { AdditionalContactsList } from './contacts/AdditionalContactsList';

export interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface ContactInfoCardProps {
  contactName: string | null;
  companySize: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  additionalContacts?: Contact[] | null;
  clientId: number;
}

export const ContactInfoCard = ({ 
  contactName, 
  companySize, 
  contactEmail, 
  contactPhone,
  additionalContacts = [],
  clientId
}: ContactInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(contactName || '');
  const [editedSize, setEditedSize] = useState(companySize || '');
  const [editedEmail, setEditedEmail] = useState(contactEmail || '');
  const [editedPhone, setEditedPhone] = useState(contactPhone || '');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(additionalContacts || []);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContact, setNewContact] = useState<Contact>({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    address: '',
    phone: ''
  });

  const updateMutation = useClientUpdate(clientId.toString(), () => {
    setIsEditing(false);
    setShowNewContactForm(false);
    toast({
      title: "Success",
      description: "Contact information updated successfully",
    });
  });

  const handleSave = () => {
    const primaryContact = {
      firstName: editedName.split(' ')[0] || '',
      lastName: editedName.split(' ').slice(1).join(' ') || '',
      title: editedTitle,
      email: editedEmail,
      phone: editedPhone,
      address: editedAddress
    };

    updateMutation.mutate({
      formData: {
        contact_name: editedName,
        company_size: editedSize,
        contact_email: editedEmail,
        contact_phone: editedPhone,
      },
      contacts: [primaryContact, ...contacts]
    });
  };

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    
    updateMutation.mutate({
      formData: {
        additional_contacts: updatedContacts
      },
      contacts: [
        {
          firstName: editedName.split(' ')[0] || '',
          lastName: editedName.split(' ').slice(1).join(' ') || '',
          title: editedTitle,
          email: editedEmail,
          phone: editedPhone,
          address: editedAddress
        },
        ...updatedContacts
      ]
    });

    setNewContact({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      address: '',
      phone: ''
    });
    setShowNewContactForm(false);
  };

  const handleRemoveContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    
    updateMutation.mutate({
      formData: {
        additional_contacts: updatedContacts
      },
      contacts: [
        {
          firstName: editedName.split(' ')[0] || '',
          lastName: editedName.split(' ').slice(1).join(' ') || '',
          title: editedTitle,
          email: editedEmail,
          phone: editedPhone,
          address: editedAddress
        },
        ...updatedContacts
      ]
    });
  };

  return (
    <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Contact */}
          <div className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-4 w-full">
                {isEditing ? (
                  <PrimaryContactForm
                    editedName={editedName}
                    editedTitle={editedTitle}
                    editedSize={editedSize}
                    editedEmail={editedEmail}
                    editedPhone={editedPhone}
                    editedAddress={editedAddress}
                    onNameChange={setEditedName}
                    onTitleChange={setEditedTitle}
                    onSizeChange={setEditedSize}
                    onEmailChange={setEditedEmail}
                    onPhoneChange={setEditedPhone}
                    onAddressChange={setEditedAddress}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <PrimaryContactView
                    contactName={contactName}
                    title={editedTitle}
                    companySize={companySize}
                    contactEmail={contactEmail}
                    contactPhone={contactPhone}
                    address={editedAddress}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Contacts */}
          <AdditionalContactsList
            contacts={contacts}
            onRemoveContact={handleRemoveContact}
          />

          {/* Add New Contact Form */}
          {showNewContactForm ? (
            <NewContactForm
              newContact={newContact}
              onContactChange={setNewContact}
              onAdd={handleAddContact}
              onCancel={() => setShowNewContactForm(false)}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowNewContactForm(true)}
              className="h-[200px] w-full flex items-center justify-center border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};