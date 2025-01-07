import { StatusSelect } from './StatusSelect';
import { LikelihoodInput } from './LikelihoodInput';
import { RevenueInputs } from './RevenueInputs';

interface DealStatusSectionProps {
  status: string;
  likelihood: string;
  projectRevenue: string;
  revenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: string;
  annualRevenueForecast: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onProjectRevenueSignedOffChange: (checked: boolean) => void;
  onProjectRevenueForecastChange: (checked: boolean) => void;
  onAnnualRevenueSignedOffChange: (value: string) => void;
  onAnnualRevenueForecastChange: (value: string) => void;
}

export const DealStatusSection = ({
  status,
  likelihood,
  projectRevenue,
  revenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast,
  onStatusChange,
  onLikelihoodChange,
  onProjectRevenueChange,
  onRevenueChange,
  onProjectRevenueSignedOffChange,
  onProjectRevenueForecastChange,
  onAnnualRevenueSignedOffChange,
  onAnnualRevenueForecastChange,
}: DealStatusSectionProps) => {
  return (
    <>
      <StatusSelect status={status} onStatusChange={onStatusChange} />
      <LikelihoodInput likelihood={likelihood} onLikelihoodChange={onLikelihoodChange} />
      <RevenueInputs
        projectRevenue={projectRevenue}
        revenue={revenue}
        projectRevenueSignedOff={projectRevenueSignedOff}
        projectRevenueForecast={projectRevenueForecast}
        annualRevenueSignedOff={annualRevenueSignedOff}
        annualRevenueForecast={annualRevenueForecast}
        onProjectRevenueChange={onProjectRevenueChange}
        onRevenueChange={onRevenueChange}
        onProjectRevenueSignedOffChange={onProjectRevenueSignedOffChange}
        onProjectRevenueForecastChange={onProjectRevenueForecastChange}
        onAnnualRevenueSignedOffChange={onAnnualRevenueSignedOffChange}
        onAnnualRevenueForecastChange={onAnnualRevenueForecastChange}
      />
    </>
  );
};