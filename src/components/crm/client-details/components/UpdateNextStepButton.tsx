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

export const UpdateNextStepButton = ({ clientId }: UpdateNextStepButtonProps) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('client_next_steps')
        .insert({
          client_id: clientId,
          notes: notes,
          due_date: dueDate || null
        });

      if (error) {
        console.error('Error adding next step:', error);
        toast({
          title: "Error",
          description: "Failed to add next step: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Next step added successfully",
      });
      
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['client-next-steps', clientId] });
      queryClient.invalidateQueries({ queryKey: ['next-steps-history', clientId] });
      
      // Reset form and close dialog
      setNotes('');
      setDueDate('');
      setOpen(false);
    } catch (error) {
      console.error('Error adding next step:', error);
      toast({
        title: "Error",
        description: "Failed to add next step. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Add Next Step
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Next Step</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Next Step</Label>
            <textarea 
              className="w-full h-24 p-3 rounded-lg border border-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter next step..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
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
            Add Step
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};