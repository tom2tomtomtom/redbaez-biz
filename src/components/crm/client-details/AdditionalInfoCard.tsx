import React from 'react';
import { Card } from '@/components/ui/card';

interface AdditionalInfoCardProps {
  industry: string;
  website: string;
  type: string;
}

export const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({
  industry,
  website,
  type
}) => {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Additional Information</h3>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-500">Industry</p>
          <p className="text-sm">{industry || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Website</p>
          <p className="text-sm">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {website}
              </a>
            ) : (
              'Not specified'
            )}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Type</p>
          <p className="text-sm capitalize">{type}</p>
        </div>
      </div>
    </Card>
  );
};