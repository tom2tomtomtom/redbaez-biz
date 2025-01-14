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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6">
        <div className="flex flex-col space-y-4">
          <DashboardHeader 
            showClientList={showClientList}
            onToggleClientList={() => setShowClientList(!showClientList)}
            onNewTaskClick={() => setIsNewTaskOpen(true)}
          />

          {!showClientList && (
            <SearchSection 
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
            />
          )}
        </div>

        {showClientList ? (
          <ClientListSection clients={clients} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <PriorityActions hideAddButton />
            <RevenueSummary />
          </div>
        )}
      </div>

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