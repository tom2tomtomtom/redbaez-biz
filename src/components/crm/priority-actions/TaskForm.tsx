
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useTaskMutations } from './hooks/useTaskMutations';
import { Task } from '@/hooks/useTaskDeletion';

interface TaskFormProps {
  task?: Task | null;
  onSaved: () => void;
  onCancel: () => void;
  defaultCategory?: string;
}

const CATEGORIES = ['Marketing', 'Product Development', 'Partnerships', 'Business Admin'] as const;

export const TaskForm = ({ task, onSaved, onCancel, defaultCategory }: TaskFormProps) => {
  const { toast } = useToast();
  const { invalidateTaskQueries } = useTaskMutations();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category || defaultCategory || CATEGORIES[0]);
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  const [urgent, setUrgent] = useState(task?.urgent || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (task?.id) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title,
            description,
            category,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            urgent,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('id', task.id);

        if (error) throw error;
        toast({
          title: "Task updated",
          description: "The task has been successfully updated.",
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            title,
            description,
            category,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            urgent,
            created_by: user?.id,
            status: 'incomplete'
          });

        if (error) throw error;
        toast({
          title: "Task created",
          description: "The new task has been successfully created.",
        });
      }

      // Invalidate all tasks queries
      await invalidateTaskQueries();
      onSaved();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "There was an error saving the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="urgent"
          checked={urgent}
          onCheckedChange={setUrgent}
        />
        <Label htmlFor="urgent">Mark as Urgent</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
