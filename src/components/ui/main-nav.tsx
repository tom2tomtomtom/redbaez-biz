import { Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ClientListSection } from "@/components/crm/dashboard/ClientListSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MainNav() {
  const [showClientList, setShowClientList] = useState(false);

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
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">
            Overview
          </Link>
          <Link to="/marketing" className="transition-colors hover:text-primary">
            Marketing
          </Link>
          <Link to="/partnerships" className="transition-colors hover:text-primary">
            Partnerships
          </Link>
          <Link to="/product-development" className="transition-colors hover:text-primary">
            Product Development
          </Link>
          <Link to="/ai-news" className="transition-colors hover:text-primary">
            AI News
          </Link>
          <Link to="/business-admin" className="transition-colors hover:text-primary">
            Business Admin
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => setShowClientList(true)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            View All Clients
          </Button>
        </div>
      </div>

      <Sheet open={showClientList} onOpenChange={setShowClientList}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto h-screen">
          <ClientListSection clients={clients} isLoading={isLoading} />
        </SheetContent>
      </Sheet>
    </div>
  );
}