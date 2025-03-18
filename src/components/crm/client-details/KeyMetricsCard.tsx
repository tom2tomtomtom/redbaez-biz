
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
  console.log('KeyMetricsCard rendering with:');
  console.log('  - revenueData:', revenueData);
  console.log('  - annualRevenueSignedOff:', annualRevenueSignedOff);
  console.log('  - annualRevenueForecast:', annualRevenueForecast);
  
  // Ensure data is valid for rendering
  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const safeSignedOff = typeof annualRevenueSignedOff === 'number' ? annualRevenueSignedOff : 0;
  const safeForecast = typeof annualRevenueForecast === 'number' ? annualRevenueForecast : 0;
  
  return (
    <Card className="col-span-1 lg:col-span-12 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <AnnualRevenueMetric 
          annualRevenue={annualRevenue} 
          annualRevenueSignedOff={safeSignedOff}
          annualRevenueForecast={safeForecast}
        />
        <DealLikelihood likelihood={likelihood} clientId={clientId} />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <RevenueChart revenueData={safeRevenueData} />
        </div>
        <div className="col-span-2">
          <ForecastEditor clientId={clientId} />
        </div>
      </div>
    </Card>
  );
};
