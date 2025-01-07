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
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Project Revenue</p>
      <p className="text-3xl font-bold text-blue-600 mb-4">
        ${projectRevenue?.toLocaleString() || '0'}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Signed Off:</p>
          <div className="flex items-center gap-2">
            {projectRevenueSignedOff ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Confirmed</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Pending</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Forecast:</p>
          <div className="flex items-center gap-2">
            {projectRevenueForecast ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">Projected</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Not Set</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};