import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CompanySectionProps {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
}

export const CompanySection = ({
  companyName,
  onCompanyNameChange,
}: CompanySectionProps) => {
  return (
    <div className="col-span-2">
      <Label>Company Name</Label>
      <Input 
        placeholder="Enter company name" 
        value={companyName}
        onChange={(e) => onCompanyNameChange(e.target.value)}
        className="transition-all duration-300" 
      />
    </div>
  );
};