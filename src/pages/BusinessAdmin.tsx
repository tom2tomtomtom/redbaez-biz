import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGeneralTasks } from '@/hooks/useGeneralTasks';
import { useState } from 'react';
import { PriorityActions } from '@/components/crm/priority-actions/PriorityActions';
import { MainNav } from '@/components/ui/main-nav';

const BusinessAdmin = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: tasks, isLoading, error } = useGeneralTasks('Business Admin', refreshTrigger);

  const handleTaskSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Business Admin Tasks */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Admin Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[calc(100vh-300px)] overflow-y-auto">
                  <PriorityActions />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Task Statistics */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Loading statistics...</p>
                  ) : error ? (
                    <p className="text-red-500">Error loading statistics</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span>Total Tasks</span>
                        <span className="font-semibold">{tasks?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span>Urgent Tasks</span>
                        <span className="font-semibold">
                          {tasks?.filter(task => task.urgent)?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span>Completed Tasks</span>
                        <span className="font-semibold">
                          {tasks?.filter(task => task.status === 'completed')?.length || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAdmin;