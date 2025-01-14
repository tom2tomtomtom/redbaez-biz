import { useQuery } from "@tanstack/react-query";
import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ChartBar, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RevenueCharts } from "@/components/crm/business-summary/components/RevenueCharts";
import { calculateRevenueData } from "@/components/crm/business-summary/utils/revenueCalculations";

export const BusinessAdmin = () => {
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

  // Calculate revenue data
  const revenueData = clientsData ? calculateRevenueData(clientsData) : { forecastData: [], achievedData: [] };

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

  // Fetch recent activities
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

  // Calculate total achieved and forecast revenue
  const totalAchievedRevenue = revenueData.achievedData.reduce((sum, item) => sum + item.revenue, 0);
  const totalForecastRevenue = revenueData.forecastData.reduce((sum, item) => sum + item.revenue, 0);

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

        <div className="mt-8">
          <RevenueCharts 
            forecastData={revenueData.forecastData}
            achievedData={revenueData.achievedData}
          />
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
                    {activeProjectsCount && clientsData?.length
                      ? `${((activeProjectsCount / clientsData.length) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Average Revenue per Client</p>
                  <p className="text-2xl font-bold">
                    ${clientsData?.length && totalAchievedRevenue
                      ? (totalAchievedRevenue / clientsData.length).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Forecast to Achieved Ratio</p>
                  <p className="text-2xl font-bold">
                    {totalAchievedRevenue
                      ? `${((totalForecastRevenue / totalAchievedRevenue) * 100).toFixed(1)}%`
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