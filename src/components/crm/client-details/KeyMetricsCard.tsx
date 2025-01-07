import { Card } from "@/components/ui/card";
import { AnnualRevenueMetric } from "./metrics/AnnualRevenueMetric";
import { ProjectRevenueMetric } from "./metrics/ProjectRevenueMetric";
import { DealLikelihood } from "./metrics/DealLikelihood";
import { RevenueChart } from "./metrics/RevenueChart";
import { MonthlyForecast } from "./types/MonthlyForecast";

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  projectRevenue: number | null;
  likelihood: number | null;
  revenueData: Array<{ month: string; value: number }>;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
  monthlyForecasts: MonthlyForecast[];
  isEditing?: boolean;
  onForecastUpdate?: (forecasts: MonthlyForecast[]) => void;
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
  monthlyForecasts,
  isEditing = false,
  onForecastUpdate
}: KeyMetricsCardProps) => {
  const handleForecastUpdate = (month: string, amount: number) => {
    if (!onForecastUpdate) return;

    const updatedForecasts = [...monthlyForecasts];
    const existingIndex = updatedForecasts.findIndex(f => f.month.endsWith(month));
    
    if (existingIndex >= 0) {
      updatedForecasts[existingIndex] = { ...updatedForecasts[existingIndex], amount };
    } else {
      updatedForecasts.push({ month: `2024-${month}`, amount });
    }

    onForecastUpdate(updatedForecasts);
  };

  return (
    <Card className="col-span-1 lg:col-span-12 p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <AnnualRevenueMetric 
          value={annualRevenue} 
          signedOffValue={annualRevenueSignedOff}
          forecastValue={annualRevenueForecast}
        />
        <ProjectRevenueMetric 
          value={projectRevenue}
          isSignedOff={projectRevenueSignedOff}
          isForecast={projectRevenueForecast}
        />
        <DealLikelihood likelihood={likelihood} />
      </div>
      <div className="mt-6">
        <RevenueChart 
          revenueData={revenueData} 
          monthlyForecasts={monthlyForecasts}
          isEditing={isEditing}
          onForecastUpdate={handleForecastUpdate}
        />
      </div>
    </Card>
  );
};