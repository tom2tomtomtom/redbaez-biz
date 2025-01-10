import { Button } from "@/components/ui/button";
import { Megaphone, Handshake, Lightbulb, LogOut, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { useState } from "react";

export function MainNav() {
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Link to="/" className="text-2xl font-bold hover:text-primary transition-colors">
            RedBaez Biz
          </Link>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="outline" asChild className="w-full md:w-auto">
                <Link to="/marketing">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Marketing
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full md:w-auto">
                <Link to="/partnerships">
                  <Handshake className="mr-2 h-4 w-4" />
                  Partnerships
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full md:w-auto">
                <Link to="/product-development">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Product Development
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Enter the client's information below</DialogDescription>
                  </DialogHeader>
                  <CRMDashboard onClientAdded={() => setIsNewClientOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>Enter the task details below</DialogDescription>
                  </DialogHeader>
                  <TaskDialog 
                    isOpen={isNewTaskOpen} 
                    onOpenChange={setIsNewTaskOpen}
                    task={null}
                    onSaved={() => setIsNewTaskOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}