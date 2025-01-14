import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ChartBar, DollarSign, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { GeneralTaskItem } from "@/components/crm/priority-actions/GeneralTaskItem";
import { Tables } from "@/integrations/supabase/types";

// ... keep existing code (imports and component start)

export const BusinessAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const queryClient = useQueryClient();

  // Fetch business admin tasks
  const { data: tasks } = useQuery({
    queryKey: ['generalTasks', 'business-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_tasks')
        .select('*')
        .eq('category', 'Business Admin')
        .order('next_due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all clients for revenue calculations
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase
        .from('clients')
        .select('*');
      return data || [];
    }
  });

  // Fetch active projects (clients with status 'active')
  const { data: activeProjectsCount } = useQuery({
    queryKey: ['active-projects'],
    queryFn: async () => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      return count || 0;
    }
  });

  // Calculate total achieved and forecast revenue using annual totals
  const { totalAchievedRevenue, totalForecastRevenue } = clientsData?.reduce((acc, client) => ({
    totalAchievedRevenue: acc.totalAchievedRevenue + (client.annual_revenue_signed_off || 0),
    totalForecastRevenue: acc.totalForecastRevenue + (client.annual_revenue_forecast || 0)
  }), { totalAchievedRevenue: 0, totalForecastRevenue: 0 }) || { totalAchievedRevenue: 0, totalForecastRevenue: 0 };

  const handleTaskSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task: Tables<'general_tasks'>) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Business Administration</h1>
          <Button onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Tasks Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Admin Tasks</CardTitle>
            <CardDescription>Manage and track business administration tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!tasks?.length ? (
                <p className="text-center text-gray-500 py-4">No business admin tasks found</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                    <GeneralTaskItem task={task} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsData?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active client base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjectsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Current active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achieved Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalAchievedRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total achieved revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast Revenue</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalForecastRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total forecast revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent business activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-4">
              No recent activities to display
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
      />
    </div>
  );
};

export default BusinessAdmin;
