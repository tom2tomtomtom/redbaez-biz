import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';
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
  additionalContacts,
  clientId
}: ContactInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(contactName || '');
  const [editedSize, setEditedSize] = useState(companySize || '');
  const [editedEmail, setEditedEmail] = useState(contactEmail || '');
  const [editedPhone, setEditedPhone] = useState(contactPhone || '');

  const updateMutation = useClientUpdate(clientId.toString(), () => {
    setIsEditing(false);
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
        contact_phone: editedPhone
      },
      contacts: [] // Maintain existing contacts array structure
    });
  };

  return (
    <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
        {!isEditing && (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            Edit Contact Info
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
                    </div>
                  </>
                )}
              </div>
              {!isEditing && <Star size={16} className="text-yellow-400" />}
            </div>
          </div>
          
          {/* Additional Contacts */}
          {additionalContacts?.map((contact: Contact, index: number) => (
            <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {`${contact.firstName} ${contact.lastName}` || 'No contact name'}
                  </h3>
                  <p className="text-sm text-gray-500">{contact.title || 'Title not specified'}</p>
                </div>
                <Star size={16} className="text-gray-400" />
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};