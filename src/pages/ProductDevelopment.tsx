import { StrategyDashboard } from "@/components/strategy/StrategyDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductDevelopment = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">Product Development Strategy</h1>
      <StrategyDashboard category="product development" />
    </div>
  );
};