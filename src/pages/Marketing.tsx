import { StrategyDashboard } from "@/components/strategy/StrategyDashboard";

export const Marketing = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Marketing Strategy</h1>
      <StrategyDashboard category="marketing" />
    </div>
  );
};