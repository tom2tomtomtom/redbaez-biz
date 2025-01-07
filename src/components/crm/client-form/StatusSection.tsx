import { CompanyDetailsSection } from './company-details/CompanyDetailsSection';
import { DealStatusSection } from './deal-status/DealStatusSection';

interface StatusSectionProps {
  status: string;
  likelihood: string;
  projectRevenue: string;
  revenue: string;
  type: string;
  industry: string;
  companySize: string;
  website: string;
  background: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
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
  background,
  onStatusChange,
  onLikelihoodChange,
  onProjectRevenueChange,
  onRevenueChange,
  onTypeChange,
  onIndustryChange,
  onCompanySizeChange,
  onWebsiteChange,
  onBackgroundChange,
}: StatusSectionProps) => {
  return (
    <>
      <CompanyDetailsSection
        type={type}
        industry={industry}
        companySize={companySize}
        website={website}
        background={background}
        onTypeChange={onTypeChange}
        onIndustryChange={onIndustryChange}
        onCompanySizeChange={onCompanySizeChange}
        onWebsiteChange={onWebsiteChange}
        onBackgroundChange={onBackgroundChange}
      />
      
      <DealStatusSection
        status={status}
        likelihood={likelihood}
        projectRevenue={projectRevenue}
        revenue={revenue}
        onStatusChange={onStatusChange}
        onLikelihoodChange={onLikelihoodChange}
        onProjectRevenueChange={onProjectRevenueChange}
        onRevenueChange={onRevenueChange}
      />
    </>
  );
};