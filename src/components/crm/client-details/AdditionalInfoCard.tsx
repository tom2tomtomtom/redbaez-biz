import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AdditionalInfoCardProps {
  industry: string | null;
  website: string | null;
  notes: string | null;
  background: string | null;
}

export const AdditionalInfoCard = ({ 
  industry, 
  website, 
  notes,
  background 
}: AdditionalInfoCardProps) => {
  return (
    <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Industry</p>
              <p className="mt-1">{industry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Website</p>
              <p className="mt-1">
                {website ? (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {website}
                  </a>
                ) : 'Not specified'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap">{notes || 'No notes available'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Background</p>
              <p className="mt-1 whitespace-pre-wrap">{background || 'No background information available'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};