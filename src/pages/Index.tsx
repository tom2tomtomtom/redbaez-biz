import { Suspense } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { ClientDetails } from "@/components/crm/ClientDetails";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <CRMDashboard />
      </Suspense>
    </div>
  );
};

export default Index;