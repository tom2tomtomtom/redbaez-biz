import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useSimpleTasks } from '@/hooks/useSimpleTasks';

export const SimpleTaskList = () => {
  const { tasks, addTask, toggleTask, deleteTask, clearCompleted } = useSimpleTasks();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center space-x-2">
            <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
            <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {tasks.some(t => t.completed) && (
        <Button variant="secondary" size="sm" onClick={clearCompleted}>
          Clear Completed
        </Button>
      )}
    </div>
  );
};
