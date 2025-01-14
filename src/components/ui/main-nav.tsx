import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function MainNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return null;
  }

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

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 bg-white border-b px-4 md:px-6 py-3 overflow-x-auto">
      <Link
        to="/"
        className="text-sm md:text-base font-medium text-gray-900 hover:text-primary transition-colors"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors"
      >
        Marketing
      </Link>
      <Link
        to="/partnerships"
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors"
      >
        Partnerships
      </Link>
      <Link
        to="/product-development"
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors"
      >
        Product Development
      </Link>
      <Link
        to="/business-admin"
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors"
      >
        Business Admin
      </Link>
      <Link
        to="/ai-news"
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors ml-auto"
      >
        AI News
      </Link>
      <Button 
        variant="ghost" 
        onClick={handleLogout}
        className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors"
      >
        Logout
      </Button>
    </nav>
  );
}