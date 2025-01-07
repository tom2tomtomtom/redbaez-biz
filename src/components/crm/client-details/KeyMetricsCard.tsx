import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnnualRevenueMetric } from './metrics/AnnualRevenueMetric';
import { ProjectRevenueMetric } from './metrics/ProjectRevenueMetric';
import { DealLikelihood } from './metrics/DealLikelihood';
import { RevenueChart } from './metrics/RevenueChart';

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  projectRevenue?: number | null;
  likelihood?: number | null;
  revenueData: Array<{ month: string; value: number }>;
  projectRevenueSignedOff?: boolean;
  projectRevenueForecast?: boolean;
  annualRevenueSignedOff?: number | null;
  annualRevenueForecast?: number | null;
}

export const KeyMetricsCard = ({ 
  annualRevenue, 
  projectRevenue, 
  likelihood,
  revenueData,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast
}: KeyMetricsCardProps) => {
  console.log('KeyMetricsCard received props:', {
    annualRevenue,
    projectRevenue,
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast
  });

  return (
    <Card className="col-span-12 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
          </div>
          
          <DealLikelihood likelihood={likelihood} />
          <RevenueChart revenueData={revenueData} />
        </div>
      </CardContent>
    </Card>
  );
};