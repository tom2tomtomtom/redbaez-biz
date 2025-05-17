
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface UpdateNextStepButtonProps {
  clientId: number;
  currentNotes?: string;
  currentDueDate?: string;
}

export const UpdateNextStepButton = ({ clientId }: UpdateNextStepButtonProps) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Could not find user profile');
      }

      // Insert next step with created_by field and category
      const { error } = await supabase
        .from('client_next_steps')
        .insert({
          client_id: clientId,
          notes: notes,
          due_date: dueDate || null,
          urgent: isUrgent,
          created_by: profileData.id,
          category: 'general' // Default to general category
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

      // If the step is marked as urgent, also update the client's urgent status
      if (isUrgent) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({ urgent: true })
          .eq('id', clientId);

        if (clientError) {
          console.error('Error updating client urgent status:', clientError);
        }
      }

      toast({
        title: "Success",
        description: "Next step added successfully",
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['client-items', clientId] });
      queryClient.invalidateQueries({ queryKey: ['next-steps-history'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['unified-tasks'] });
      
      // Reset form and close dialog
      setNotes('');
      setDueDate('');
      setIsUrgent(false);
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

          <div className="flex items-center space-x-2">
            <Switch
              id="urgent"
              checked={isUrgent}
              onCheckedChange={setIsUrgent}
            />
            <Label htmlFor="urgent">Mark as Urgent</Label>
          </div>

          <Button type="submit" className="w-full">
            Add Step
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
