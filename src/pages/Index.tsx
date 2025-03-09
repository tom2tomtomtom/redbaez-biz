
import { Suspense, useState, useEffect } from "react";
import { MainNav } from "@/components/ui/main-nav";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { RevenueSummary } from "@/components/crm/revenue-summary/RevenueSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { DashboardHeader } from "@/components/crm/dashboard/DashboardHeader";
import { SearchSection } from "@/components/crm/dashboard/SearchSection";
import { ClientListSection } from "@/components/crm/dashboard/ClientListSection";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const navigate = useNavigate();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', refreshTrigger], // Use refreshTrigger to ensure fresh data
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
      return data;
    },
    staleTime: 0, // Don't cache
    gcTime: 0
  });

  // Force refresh when page loads
  useEffect(() => {
    console.log("Index page mounted - setting refresh trigger");
    // Show a toast to indicate the data is being loaded
    toast({
      title: "Loading dashboard",
      description: "Refreshing your dashboard data..."
    });
    
    // Refresh data
    setRefreshTrigger(Date.now());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-8">
        <DashboardHeader 
          showClientList={showClientList}
          onToggleClientList={() => setShowClientList(!showClientList)}
          onNewTaskClick={() => setIsNewTaskOpen(true)}
        />

        <div className="space-y-8">
          <SearchSection 
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
          />

          <div className="rounded-lg bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-left">Priority Actions</h2>
            <div>
              <PriorityActions 
                key={`priority-actions-${refreshTrigger}`}
                hideAddButton 
              />
            </div>
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
        onSaved={() => {
          setIsNewTaskOpen(false);
          // Refresh the priority actions when a new task is saved
          setRefreshTrigger(Date.now());
        }}
      />
    </div>
  );
};

export default Index;
