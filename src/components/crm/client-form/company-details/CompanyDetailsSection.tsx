import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanyDetailsSectionProps {
  type: string;
  industry: string;
  companySize: string;
  website: string;
  background: string;
  onTypeChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
}

export const CompanyDetailsSection = ({
  type,
  industry,
  companySize,
  website,
  background,
  onTypeChange,
  onIndustryChange,
  onCompanySizeChange,
  onWebsiteChange,
  onBackgroundChange,
}: CompanyDetailsSectionProps) => {
  return (
    <>
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="transition-all duration-300">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="non-profit">Non-Profit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Industry</Label>
        <Select value={industry} onValueChange={onIndustryChange}>
          <SelectTrigger className="transition-all duration-300">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="real-estate">Real Estate</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Company Size</Label>
        <Select value={companySize} onValueChange={onCompanySizeChange}>
          <SelectTrigger className="transition-all duration-300">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501+">501+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Website</Label>
        <Input 
          type="url" 
          placeholder="Enter website URL" 
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          className="transition-all duration-300" 
        />
      </div>

      <div className="col-span-2">
        <Label>Background</Label>
        <Textarea 
          placeholder="Enter company background" 
          value={background}
          onChange={(e) => onBackgroundChange(e.target.value)}
          className="transition-all duration-300 min-h-[100px]" 
        />
      </div>
    </>
  );
};