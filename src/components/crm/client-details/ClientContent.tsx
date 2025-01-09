import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { NextStepsHistory } from './NextStepsHistory';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({
  client,
  isEditing,
  parsedAdditionalContacts,
}: ClientContentProps) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month, index) => {
    const monthLower = month.toLowerCase();
    return {
      month,
      actual: client[`actual_${monthLower}`] || 0,
      forecast: client[`forecast_${monthLower}`] || 0
    };
  });

  // Calculate total actual revenue
  const totalActualRevenue = Object.entries(client)
    .filter(([key, value]) => key.startsWith('actual_'))
    .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

  const handleUrgentChange = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ urgent: checked })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: checked ? "Marked as urgent" : "Removed urgent flag",
        description: `Successfully ${checked ? 'marked' : 'unmarked'} as urgent`,
      });
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <KeyMetricsCard 
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        annualRevenueSignedOff={totalActualRevenue}
        annualRevenueForecast={client.annual_revenue_forecast}
        clientId={client.id}
      />

      <ContactInfoCard 
        contactName={client.contact_name}
        companySize={client.company_size}
        contactEmail={client.contact_email}
        contactPhone={client.contact_phone}
        additionalContacts={parsedAdditionalContacts}
      />

      <AdditionalInfoCard 
        industry={client.industry}
        website={client.website}
        notes={client.notes}
        background={client.background}
      />

      <div className="lg:col-span-6">
        <NextStepsHistory clientId={client.id} />
      </div>

      <div className="col-span-12 flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        {client.urgent && (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
        <div className="flex items-center space-x-2">
          <Switch
            id="urgent"
            checked={client.urgent || false}
            onCheckedChange={handleUrgentChange}
          />
          <Label htmlFor="urgent">Mark as Urgent Priority</Label>
        </div>
      </div>
    </div>
  );
};