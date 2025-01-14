import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  showClientList: boolean;
  onToggleClientList: () => void;
  onNewTaskClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showClientList,
  onToggleClientList,
  onNewTaskClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Redbaez Biz</h1>
      <div className="flex gap-4">
        <Button 
          variant="outline"
          onClick={onToggleClientList}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          {showClientList ? 'Hide Clients' : 'View All Clients'}
        </Button>
        <Button 
          className="gap-2"
          onClick={() => navigate('/client/new')}
        >
          <Plus className="h-4 w-4" />
          Add New Client
        </Button>
        <Button 
          variant="secondary" 
          className="gap-2"
          onClick={onNewTaskClick}
        >
          <FileText className="h-4 w-4" />
          Add New Task
        </Button>
      </div>
    </div>
  );
};