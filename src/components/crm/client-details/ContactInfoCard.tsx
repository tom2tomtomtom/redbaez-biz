import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star, Plus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientUpdate } from './useClientUpdate';
import { toast } from '@/components/ui/use-toast';

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
    updateMutation.mutate({
      formData: {
        contact_name: editedName,
        company_size: editedSize,
        contact_email: editedEmail,
        contact_phone: editedPhone,
        additional_contacts: contacts
      },
      contacts: []
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
      contacts: []
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
      contacts: []
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
                  <>
                    <div>
                      <label className="text-sm text-gray-500">Contact Name</label>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Title</label>
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="mt-1"
                        placeholder="Enter title"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Company Size</label>
                      <Input
                        value={editedSize}
                        onChange={(e) => setEditedSize(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <Input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <Input
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Address</label>
                      <Input
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        className="mt-1"
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSave} className="w-full">
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900">{contactName || 'No contact name'}</h3>
                    <p className="text-sm text-gray-500">{editedTitle || 'Title not specified'}</p>
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
                        {editedAddress || 'No address provided'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!isEditing && <Star size={16} className="text-yellow-400" />}
            </div>
          </div>
          
          {/* Additional Contacts */}
          {contacts?.map((contact: Contact, index: number) => (
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
                    onClick={() => handleRemoveContact(index)}
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

          {/* Add New Contact Form */}
          {showNewContactForm && (
            <div className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
              <h3 className="font-medium text-gray-900 mb-4">Add New Contact</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-500">First Name*</label>
                    <Input
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name*</label>
                    <Input
                      value={newContact.lastName}
                      onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Title</label>
                  <Input
                    value={newContact.title}
                    onChange={(e) => setNewContact({...newContact, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <Input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <Input
                    value={newContact.address}
                    onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddContact} className="w-full">
                    Add Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewContactForm(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Contact Button */}
          {!showNewContactForm && (
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