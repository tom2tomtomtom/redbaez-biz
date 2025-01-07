import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusSectionProps {
  status: string;
  likelihood: string;
  projectRevenue: string;
  revenue: string;
  type: string;
  industry: string;
  companySize: string;
  website: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
}

export const StatusSection = ({
  status,
  likelihood,
  projectRevenue,
  revenue,
  type,
  industry,
  companySize,
  website,
  onStatusChange,
  onLikelihoodChange,
  onProjectRevenueChange,
  onRevenueChange,
  onTypeChange,
  onIndustryChange,
  onCompanySizeChange,
  onWebsiteChange,
}: StatusSectionProps) => {
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

      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
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
          onChange={(e) => onLikelihoodChange(e.target.value)}
          className="transition-all duration-300" 
        />
      </div>

      <div>
        <Label>Project Revenue ($)</Label>
        <Input 
          type="number" 
          placeholder="Enter project revenue" 
          value={projectRevenue}
          onChange={(e) => onProjectRevenueChange(e.target.value)}
          className="transition-all duration-300" 
        />
      </div>

      <div>
        <Label>Annual Revenue ($)</Label>
        <Input 
          type="number" 
          placeholder="Enter annual revenue" 
          value={revenue}
          onChange={(e) => onRevenueChange(e.target.value)}
          className="transition-all duration-300" 
        />
      </div>
    </>
  );
};