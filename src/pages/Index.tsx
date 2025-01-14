import { Suspense, useState } from "react";
import { MainNav } from "@/components/ui/main-nav";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { RevenueSummary } from "@/components/crm/revenue-summary/RevenueSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { DashboardHeader } from "@/components/crm/dashboard/DashboardHeader";
import { SearchSection } from "@/components/crm/dashboard/SearchSection";
import { ClientListSection } from "@/components/crm/dashboard/ClientListSection";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

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
            <div className="max-h-[800px] overflow-y-auto">
              <PriorityActions hideAddButton />
            </div>
          </div>

          <div className="rounded-lg bg-card p-8 shadow-sm">
            {showClientList ? (
              <ClientListSection clients={clients} isLoading={isLoading} />
            ) : (
              <RevenueSummary />
            )}
          </div>
        </div>
      </main>

      <TaskDialog 
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => {
          setIsNewTaskOpen(false);
        }}
      />
    </div>
  );
};

export default Index;