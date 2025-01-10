import { StrategyDashboard } from "@/components/strategy/StrategyDashboard";
import { MainNav } from "@/components/ui/main-nav";

export const ProductDevelopment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Product Development Strategy</h1>
        <StrategyDashboard category="product development" />
      </div>
    </div>
  );
};