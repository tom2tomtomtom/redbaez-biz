import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { MainNav } from "@/components/ui/main-nav";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { RevenueSummary } from "@/components/crm/revenue-summary/RevenueSummary";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { DashboardHeader } from "@/components/crm/dashboard/DashboardHeader";
import { SearchSection } from "@/components/crm/dashboard/SearchSection";
import { ClientListSection } from "@/components/crm/dashboard/ClientListSection";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQueryCacheManager } from "@/components/crm/priority-actions/hooks/useQueryCacheManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const navigate = useNavigate();
  const { invalidateQueries } = useQueryCacheManager();
  const initialLoadDone = useRef(false);
  const queryClient = useQueryClient();

  const {
    data: clients,
    isLoading,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['clients', refreshTrigger],
    queryFn: async () => {
      console.log("Fetching clients...");
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) {
        console.error("Error fetching clients:", error);
        throw error;
      }
      console.log("Fetched clients:", data?.length);
      return data || []; // Ensure we always return an array even if data is null
    },
    staleTime: 0, // Always refetch when requested
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    initialData: [] // Start with empty array instead of undefined
  });

  const handleRefresh = useCallback(async () => {
    toast({
      title: "Refreshing dashboard",
      description: "Updating with the latest data..."
    });
    
    try {
      // Clear all cached data
      await Promise.all([
        invalidateQueries(),
        
        // Force remove specific cached queries
        queryClient.removeQueries({ queryKey: ['monthly-revenue'] }),
        queryClient.removeQueries({ queryKey: ['tasks'] }),
        queryClient.removeQueries({ queryKey: ['clients'] })
      ]);
      
      // Trigger refresh
      setRefreshTrigger(Date.now());
      
      // Force refetch important data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['monthly-revenue'] }),
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
        queryClient.refetchQueries({ queryKey: ['clients'] })
      ]);
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
      toast({
        title: "Refresh failed",
        description: "Could not update dashboard data. Please try again.",
        variant: "destructive"
      });
    }
  }, [invalidateQueries, queryClient]);

  // Handle client list toggle with pre-fetching
  const handleToggleClientList = useCallback(() => {
    // If we're about to show the client list, ensure data is fresh
    if (!showClientList) {
      // Immediately refetch clients before showing the slide-out panel
      refetchClients().catch(error => {
        console.error("Error pre-fetching clients:", error);
        toast({
          title: "Error loading clients",
          description: "There was a problem loading the client list.",
          variant: "destructive"
        });
      });
    }
    
    // Toggle the client list display state
    setShowClientList(prev => !prev);
  }, [showClientList, refetchClients]);

  // Force refresh only once when page first loads
  useEffect(() => {
    if (!initialLoadDone.current) {
      const loadDashboard = async () => {
        console.log("Index page mounted - refreshing data");
        
        // Show a toast to indicate the data is being loaded
        toast({
          title: "Loading dashboard",
          description: "Refreshing your dashboard data..."
        });
        
        // Clear all cached data first
        await Promise.all([
          queryClient.removeQueries({ queryKey: ['monthly-revenue'] }),
          queryClient.removeQueries({ queryKey: ['tasks'] }),
          queryClient.removeQueries({ queryKey: ['clients'] })
        ]);
        
        // Immediately fetch clients data
        await refetchClients();
        
        // Invalidate all query cache to ensure fresh data
        await invalidateQueries();
        
        // Update refresh trigger to force component refreshes
        setRefreshTrigger(Date.now());
        initialLoadDone.current = true;
      };
      
      loadDashboard();
    }
  }, [invalidateQueries, queryClient, refetchClients]);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-8">
        <DashboardHeader 
          showClientList={showClientList}
          onToggleClientList={handleToggleClientList}
          onNewTaskClick={() => setIsNewTaskOpen(true)}
        />

        {clientsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Failed to load client data. Please try refreshing.</span>
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <SearchSection 
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
          />

          <div className="rounded-lg bg-card p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-left">Priority Actions</h2>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
            <PriorityActions 
              key={`priority-actions-${refreshTrigger}`}
              hideAddButton 
            />
          </div>

          <div className="rounded-lg bg-card p-8 shadow-sm">
            <RevenueSummary />
          </div>
        </div>
      </main>

      <Sheet open={showClientList} onOpenChange={setShowClientList}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto h-screen">
          <ClientListSection clients={clients} isLoading={isLoading} />
        </SheetContent>
      </Sheet>

      <TaskDialog 
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={async () => {
          setIsNewTaskOpen(false);
          // Refresh all data when a new task is saved
          await invalidateQueries();
          setRefreshTrigger(Date.now());
        }}
      />
    </div>
  );
};

export default Index;
