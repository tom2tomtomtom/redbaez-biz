import React, { useState } from 'react';
import { ClientForm } from './client-form/ClientForm';
import { IntelSearch } from './intel-search/IntelSearch';
import { ClientSearch } from './client-search/ClientSearch';
import { BusinessSummary } from './business-summary/BusinessSummary';
import { CalendarView } from '../calendar/CalendarView';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CRMDashboardProps {
  onClientAdded?: () => void;
}

export const CRMDashboard = ({ onClientAdded }: CRMDashboardProps) => {
  const [contacts, setContacts] = useState([{ 
    firstName: '', 
    lastName: '', 
    title: '', 
    email: '', 
    address: '', 
    phone: '' 
  }]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4 animate-fade-in relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 rounded-full"
        onClick={() => navigate('/')}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="grid grid-cols-1 gap-4">
        <ClientForm
          contacts={contacts}
          nextSteps={nextSteps}
          nextDueDate={nextDueDate}
          onContactsChange={setContacts}
          onNextStepsChange={setNextSteps}
          onNextDueDateChange={setNextDueDate}
          onClientAdded={onClientAdded}
        />
      </div>
    </div>
  );
};