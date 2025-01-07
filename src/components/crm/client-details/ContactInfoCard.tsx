import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';

interface ContactInfoCardProps {
  contactName: string | null;
  companySize: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  additionalContacts?: any[] | null;
}

export const ContactInfoCard = ({ 
  contactName, 
  companySize, 
  contactEmail, 
  contactPhone,
  additionalContacts 
}: ContactInfoCardProps) => {
  console.log('ContactInfoCard received props:', { contactName, companySize, contactEmail, contactPhone, additionalContacts });
  
  return (
    <Card className="col-span-12 lg:col-span-8 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Contact */}
          <div className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{contactName || 'No contact name'}</h3>
                <p className="text-sm text-gray-500">{companySize || 'Company size not specified'}</p>
              </div>
              <Star size={16} className="text-yellow-400" />
            </div>
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
          </div>
          
          {/* Additional Contacts */}
          {additionalContacts?.map((contact: any, index: number) => (
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