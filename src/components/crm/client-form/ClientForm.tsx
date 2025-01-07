import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import { ContactsList } from './ContactsList';
import { StatusSection } from './StatusSection';
import { NextStepsSection } from './NextStepsSection';
import { CompanySection } from './CompanySection';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface ClientFormProps {
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
}

export const ClientForm = ({
  contacts,
  nextSteps,
  nextDueDate,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
}: ClientFormProps) => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('');
  const [likelihood, setLikelihood] = useState('');
  const [projectRevenue, setProjectRevenue] = useState('');
  const [revenue, setRevenue] = useState('');
  const [type, setType] = useState('business');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCompanyName('');
    setStatus('');
    setLikelihood('');
    setProjectRevenue('');
    setRevenue('');
    setType('business');
    setIndustry('');
    setCompanySize('');
    setWebsite('');
    setBackground('');
    onContactsChange([{ 
      firstName: '', 
      lastName: '', 
      title: '', 
      email: '', 
      address: '', 
      phone: '' 
    }]);
    onNextStepsChange('');
    onNextDueDateChange('');
  };

  const handleSave = async () => {
    if (!companyName) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const primaryContact = contacts[0] || { 
        firstName: '', 
        lastName: '', 
        title: '', 
        email: '', 
        address: '', 
        phone: '' 
      };
      
      const { error } = await supabase
        .from('clients')
        .insert({
          name: companyName,
          type: type,
          industry: industry || null,
          contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
          contact_email: primaryContact.email,
          contact_phone: primaryContact.phone,
          company_size: companySize || null,
          status: status || 'prospect',
          annual_revenue: revenue ? parseFloat(revenue) : null,
          website: website || null,
          notes: nextSteps,
          background: background || null,
          missing_fields: [],
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client information saved successfully",
      });

      resetForm();

    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>New Client Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompanySection 
            companyName={companyName}
            onCompanyNameChange={setCompanyName}
          />

          <div className="col-span-2">
            <ContactsList 
              contacts={contacts}
              onContactsChange={onContactsChange}
            />
          </div>

          <StatusSection
            status={status}
            likelihood={likelihood}
            projectRevenue={projectRevenue}
            revenue={revenue}
            type={type}
            industry={industry}
            companySize={companySize}
            website={website}
            background={background}
            onStatusChange={setStatus}
            onLikelihoodChange={setLikelihood}
            onProjectRevenueChange={setProjectRevenue}
            onRevenueChange={setRevenue}
            onTypeChange={setType}
            onIndustryChange={setIndustry}
            onCompanySizeChange={setCompanySize}
            onWebsiteChange={setWebsite}
            onBackgroundChange={setBackground}
          />

          <NextStepsSection
            nextSteps={nextSteps}
            nextDueDate={nextDueDate}
            onNextStepsChange={onNextStepsChange}
            onNextDueDateChange={onNextDueDateChange}
          />
        </div>

        <div className="mt-6 border-t pt-6">
          <Button 
            className="w-full py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.01]"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Client Information'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};