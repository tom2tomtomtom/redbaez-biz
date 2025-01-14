import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function MainNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        duration: 2000
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl md:px-6">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar lg:space-x-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors md:text-base text-gray-900 hover:text-primary"
          >
            Overview
          </Link>
          <Link
            to="/business-admin"
            className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary"
          >
            Business Admin
          </Link>
          <Link
            to="/marketing"
            className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary"
          >
            Marketing
          </Link>
          <Link
            to="/partnerships"
            className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary"
          >
            Partnerships
          </Link>
          <Link
            to="/product-development"
            className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
          >
            Product Development
          </Link>
          <Link
            to="/ai-news"
            className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary"
          >
            AI News
          </Link>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-sm transition-colors md:text-base text-gray-600 hover:text-primary ml-4"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}