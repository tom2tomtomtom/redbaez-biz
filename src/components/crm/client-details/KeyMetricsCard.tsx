import { Card } from "@/components/ui/card";
import { AnnualRevenueMetric } from "./metrics/AnnualRevenueMetric";
import { ProjectRevenueMetric } from "./metrics/ProjectRevenueMetric";
import { DealLikelihood } from "./metrics/DealLikelihood";
import { RevenueChart } from "./metrics/RevenueChart";

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  projectRevenue: number | null;
  likelihood: number | null;
  revenueData: Array<{ month: string; value: number }>;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
}

export const KeyMetricsCard = ({
  annualRevenue,
  projectRevenue,
  likelihood,
  revenueData,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast,
}: KeyMetricsCardProps) => {
  return (
    <Card className="col-span-1 lg:col-span-12 p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <AnnualRevenueMetric 
          annualRevenue={annualRevenue} 
          annualRevenueSignedOff={annualRevenueSignedOff}
          annualRevenueForecast={annualRevenueForecast}
        />
        <ProjectRevenueMetric 
          projectRevenue={projectRevenue}
          projectRevenueSignedOff={projectRevenueSignedOff}
          projectRevenueForecast={projectRevenueForecast}
        />
        <DealLikelihood likelihood={likelihood} />
      </div>
      <div className="mt-6">
        <RevenueChart 
          revenueData={revenueData}
        />
      </div>
    </Card>
  );
};