import { SimpleTaskList } from '@/components/simple-tasks/SimpleTaskList';

export const SimpleTasks = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Simple Task System</h1>
      <SimpleTaskList />
    </div>
  );
};

export default SimpleTasks;
