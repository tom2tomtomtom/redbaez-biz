import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const PriorityActions = () => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Priority Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  H
                </div>
                <div>
                  <span className="font-medium">Follow up with ABC Corp</span>
                  <p className="text-sm text-gray-600 mt-1">Review Q4 proposal</p>
                </div>
              </div>
              <span className="text-sm bg-red-100 px-2 py-1 rounded-full text-red-600">Due Today</span>
            </div>
            <div className="mt-2 text-sm flex items-center gap-2">
              <Calendar size={14} />
              Due: Jan 7, 2025
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <div>
                  <span className="font-medium">Schedule XYZ Inc meeting</span>
                  <p className="text-sm text-gray-600 mt-1">Product demo</p>
                </div>
              </div>
              <span className="text-sm bg-orange-100 px-2 py-1 rounded-full text-orange-600">Tomorrow</span>
            </div>
            <div className="mt-2 text-sm flex items-center gap-2">
              <Calendar size={14} />
              Due: Jan 8, 2025
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};