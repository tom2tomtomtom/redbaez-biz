import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Contact {
  name: string;
  title: string;
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
  const [isLoading, setIsLoading] = useState(false);

  const addContact = () => {
    onContactsChange([...contacts, { name: '', title: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      onContactsChange(contacts.filter((_, i) => i !== index));
    }
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onContactsChange(newContacts);
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
      const primaryContact = contacts[0] || { name: '', title: '' };
      
      const { error } = await supabase
        .from('clients')
        .insert({
          name: companyName,
          type: 'business', // default type
          contact_name: primaryContact.name,
          status: status || 'prospect',
          notes: nextSteps,
          missing_fields: [],
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client information saved successfully",
      });

      // Reset form
      setCompanyName('');
      setStatus('');
      setLikelihood('');
      onContactsChange([{ name: '', title: '' }]);
      onNextStepsChange('');
      onNextDueDateChange('');

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
          <div className="col-span-2">
            <Label>Company Name</Label>
            <Input 
              placeholder="Enter company name" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="transition-all duration-300" 
            />
          </div>

          <div className="col-span-2">
            <Label>Contacts</Label>
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input 
                    placeholder="Contact Name"
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    className="transition-all duration-300"
                  />
                  <Input 
                    placeholder="Title"
                    value={contact.title}
                    onChange={(e) => handleContactChange(index, 'title', e.target.value)}
                    className="transition-all duration-300"
                  />
                  <Button 
                    variant="destructive"
                    onClick={() => removeContact(index)}
                    className="transition-all duration-300"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={addContact}
                className="w-full transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="transition-all duration-300">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="negotiation">In Negotiation</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Likelihood (%)</Label>
            <Input 
              type="number" 
              placeholder="Enter %" 
              value={likelihood}
              onChange={(e) => setLikelihood(e.target.value)}
              className="transition-all duration-300" 
            />
          </div>

          <div className="col-span-2">
            <Label>Next Steps</Label>
            <textarea 
              className="w-full h-24 p-3 rounded-lg border border-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter next steps..."
              value={nextSteps}
              onChange={(e) => onNextStepsChange(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <Label className="text-primary font-medium">Next Step Due Date</Label>
              <div className="relative mt-2">
                <Input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => onNextDueDateChange(e.target.value)}
                  className="pr-10 transition-all duration-300"
                />
                <Calendar className="absolute right-3 top-2.5 text-primary" size={16} />
              </div>
            </div>
          </div>
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