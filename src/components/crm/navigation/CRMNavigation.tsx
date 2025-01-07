import { Button } from '@/components/ui/button';

interface CRMNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CRMNavigation = ({ activeTab, setActiveTab }: CRMNavigationProps) => {
  return (
    <div className="flex space-x-4">
      <Button 
        onClick={() => setActiveTab('newClient')}
        variant={activeTab === 'newClient' ? 'default' : 'outline'}
        className="transition-all duration-300"
      >
        New Client Entry
      </Button>
      <Button 
        onClick={() => setActiveTab('priorities')}
        variant={activeTab === 'priorities' ? 'default' : 'outline'}
        className="transition-all duration-300"
      >
        Priorities
      </Button>
    </div>
  );
};