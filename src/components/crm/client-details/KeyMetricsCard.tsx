import { Card } from "@/components/ui/card";
import { AnnualRevenueMetric } from "./metrics/AnnualRevenueMetric";
import { ProjectRevenueMetric } from "./metrics/ProjectRevenueMetric";
import { DealLikelihood } from "./metrics/DealLikelihood";
import { RevenueChart } from "./metrics/RevenueChart";
import { ForecastEditor } from "./metrics/ForecastEditor";

interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  projectRevenue: number | null;
  likelihood: number | null;
  revenueData: RevenueData[];
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
  clientId: number;
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
  clientId,
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
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <RevenueChart revenueData={revenueData} />
        </div>
        <div>
          <ForecastEditor clientId={clientId} />
        </div>
      </div>
    </Card>
  );
};