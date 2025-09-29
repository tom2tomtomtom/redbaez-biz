
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTaskMutations } from './hooks/useTaskMutations';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useApiRequest } from '@/hooks/useApiRequest';
import logger from '@/utils/logger';

interface TaskFormProps {
  task?: Task | null;
  onSaved: () => void;
  onCancel: () => void;
  defaultCategory?: string;
  clientId?: number; // Add client association support
}

const CATEGORIES = ['Marketing', 'Product Development', 'Partnerships', 'Business Admin'] as const;

export const TaskForm = ({ task, onSaved, onCancel, defaultCategory, clientId }: TaskFormProps) => {
  const { toast } = useToast();
  const { invalidateTaskQueries } = useTaskMutations();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category || defaultCategory || CATEGORIES[0]);
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'normal');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');

  // Use our standardized API request hook for saving the task
  const { execute: saveTask, isLoading: isSubmitting } = useApiRequest(
    async (formData: any) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (task?.id) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('id', task.id);

        if (error) throw error;
        return { success: true, message: "Task updated successfully" };
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...formData,
            created_by: user?.id,
            status: 'pending'
          });

        if (error) throw error;
        return { success: true, message: "Task created successfully" };
      }
    },
    {
      onSuccess: async () => {
        await invalidateTaskQueries();
        onSaved();
      },
      successMessage: task ? "Task updated successfully" : "Task created successfully",
      errorMessage: "There was an error saving the task. Please try again.",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title,
      description,
      category,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      status: task ? status : 'pending', // New tasks default to pending
      urgent: priority === 'urgent', // Map priority to legacy urgent field
      client_id: clientId || task?.client_id || null, // Support client association
    };
    
    logger.info('Submitting task form', { isUpdate: !!task?.id, formData });
    await saveTask(formData);
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

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">🟢 Low</SelectItem>
            <SelectItem value="normal">🔵 Normal</SelectItem>
            <SelectItem value="high">🟠 High</SelectItem>
            <SelectItem value="urgent">🔴 Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {task && (
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
