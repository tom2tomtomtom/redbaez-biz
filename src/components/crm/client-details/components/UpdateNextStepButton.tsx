import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface UpdateNextStepButtonProps {
  clientId: number;
  currentNotes?: string;
  currentDueDate?: string;
}

export const UpdateNextStepButton = ({ clientId, currentNotes, currentDueDate }: UpdateNextStepButtonProps) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(currentNotes || '');
  const [dueDate, setDueDate] = useState(currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : '');
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          notes: notes,
          next_due_date: dueDate || null
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Next steps updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      setOpen(false);
    } catch (error) {
      console.error('Error updating next steps:', error);
      toast({
        title: "Error",
        description: "Failed to update next steps",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Update Next Step
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Next Step</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Next Steps</Label>
            <textarea 
              className="w-full h-24 p-3 rounded-lg border border-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};