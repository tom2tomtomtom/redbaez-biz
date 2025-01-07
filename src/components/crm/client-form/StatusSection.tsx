import { CompanyDetailsSection } from './company-details/CompanyDetailsSection';
import { DealStatusSection } from './deal-status/DealStatusSection';

interface StatusSectionProps {
  status: string;
  likelihood: string;
  type: string;
  industry: string;
  companySize: string;
  website: string;
  background: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
}

export const StatusSection = ({
  status,
  likelihood,
  type,
  industry,
  companySize,
  website,
  background,
  onStatusChange,
  onLikelihoodChange,
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
        onStatusChange={onStatusChange}
        onLikelihoodChange={onLikelihoodChange}
      />
    </>
  );
};