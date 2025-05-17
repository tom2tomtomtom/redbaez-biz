import { useEffect, useState } from 'react';

export interface SimpleTask {
  id: string;
  title: string;
  completed: boolean;
}

const STORAGE_KEY = 'simple_tasks';

export const useSimpleTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored) as SimpleTask[]);
      } catch {
        // ignore parse errors and reset
        setTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string) => {
    const newTask: SimpleTask = {
      id: crypto.randomUUID(),
      title,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  return { tasks, addTask, toggleTask, deleteTask, clearCompleted };
};
