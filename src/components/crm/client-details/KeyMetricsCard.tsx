
import { Card } from "@/components/ui/card";
import { AnnualRevenueMetric } from "./metrics/AnnualRevenueMetric";
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
  likelihood: number | null;
  revenueData: RevenueData[];
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
  clientId: number;
}

export const KeyMetricsCard = ({
  annualRevenue,
  likelihood,
  revenueData,
  annualRevenueSignedOff,
  annualRevenueForecast,
  clientId,
}: KeyMetricsCardProps) => {
  console.log('KeyMetricsCard revenue data:', revenueData);
  console.log('KeyMetricsCard annualRevenueSignedOff:', annualRevenueSignedOff);
  console.log('KeyMetricsCard annualRevenueForecast:', annualRevenueForecast);
  
  return (
    <Card className="col-span-1 lg:col-span-12 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <AnnualRevenueMetric 
          annualRevenue={annualRevenue} 
          annualRevenueSignedOff={annualRevenueSignedOff || 0}
          annualRevenueForecast={annualRevenueForecast || 0}
        />
        <DealLikelihood likelihood={likelihood} clientId={clientId} />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <RevenueChart revenueData={revenueData || []} />
        </div>
        <div className="col-span-2">
          <ForecastEditor clientId={clientId} />
        </div>
      </div>
    </Card>
  );
};
