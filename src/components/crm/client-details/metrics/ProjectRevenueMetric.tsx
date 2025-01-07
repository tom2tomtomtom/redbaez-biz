import { CheckCircle2, XCircle } from 'lucide-react';

interface ProjectRevenueMetricProps {
  projectRevenue: number | null;
  projectRevenueSignedOff?: boolean;
  projectRevenueForecast?: boolean;
}

export const ProjectRevenueMetric = ({
  projectRevenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
}: ProjectRevenueMetricProps) => {
  return (
    <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
      <p className="text-sm text-primary font-medium">Project Revenue</p>
      <p className="text-2xl font-semibold text-primary">
        ${projectRevenue?.toLocaleString() || 'N/A'}
      </p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Signed Off:</span>
          <div className="flex items-center">
            {projectRevenueSignedOff ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="ml-1 text-xs text-green-600">Confirmed</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="ml-1 text-xs text-red-600">Pending</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Forecast:</span>
          <div className="flex items-center">
            {projectRevenueForecast ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="ml-1 text-xs text-blue-600">Projected</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="ml-1 text-xs text-gray-600">Not Set</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};