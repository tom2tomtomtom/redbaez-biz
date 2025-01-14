import { useQuery } from "@tanstack/react-query";
import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ChartBar, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const BusinessAdmin = () => {
  // Fetch total number of clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      return count || 0;
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

  // Fetch total revenue (sum of all client revenues)
  const { data: revenueData } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('clients')
        .select('project_revenue');
      return data?.reduce((sum, client) => sum + (client.project_revenue || 0), 0) || 0;
    }
  });

  // Fetch recent activities (combination of status changes and next steps)
  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data: statusHistory } = await supabase
        .from('client_status_history')
        .select(`
          id,
          created_at,
          status,
          notes,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: nextSteps } = await supabase
        .from('client_next_steps')
        .select(`
          id,
          created_at,
          notes,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort both types of activities
      const allActivities = [
        ...(statusHistory?.map(sh => ({
          id: sh.id,
          type: 'status',
          date: sh.created_at,
          description: `${sh.clients?.name}: Status changed to ${sh.status}`,
          details: sh.notes
        })) || []),
        ...(nextSteps?.map(ns => ({
          id: ns.id,
          type: 'next_step',
          date: ns.created_at,
          description: `${ns.clients?.name}: New next step added`,
          details: ns.notes
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      return allActivities;
    }
  });

  // Calculate growth rate (comparing current month's revenue to previous month)
  const { data: growthRate } = useQuery({
    queryKey: ['growth-rate'],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      
      const { data: currentMonthData } = await supabase
        .from('client_forecasts')
        .select('amount')
        .eq('month', format(currentDate, 'yyyy-MM'));
      
      const { data: previousMonthData } = await supabase
        .from('client_forecasts')
        .select('amount')
        .eq('month', format(new Date(currentDate.getFullYear(), previousMonth - 1), 'yyyy-MM'));

      const currentTotal = currentMonthData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      const previousTotal = previousMonthData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

      if (previousTotal === 0) return 0;
      return ((currentTotal - previousTotal) / previousTotal) * 100;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Business Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsData || 0}</div>
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Total project revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {growthRate ? `${growthRate.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">Month over month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Overview of recent business activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), 'PPp')}
                      </p>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Client Retention Rate</p>
                  <p className="text-2xl font-bold">
                    {activeProjectsCount && clientsData
                      ? `${((activeProjectsCount / clientsData) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Average Revenue per Client</p>
                  <p className="text-2xl font-bold">
                    ${clientsData && revenueData
                      ? (revenueData / clientsData).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Active Projects Rate</p>
                  <p className="text-2xl font-bold">
                    {activeProjectsCount && clientsData
                      ? `${((activeProjectsCount / clientsData) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessAdmin;