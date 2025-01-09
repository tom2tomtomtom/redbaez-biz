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

  const handleClose = () => {
    if (onClientAdded) {
      // If we're in a dialog (indicated by onClientAdded prop), call it to close the dialog
      onClientAdded();
    } else {
      // If we're not in a dialog, navigate to home and force a refresh
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col space-y-4 animate-fade-in relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 rounded-full"
        onClick={handleClose}
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
          onClientAdded={handleClose}
        />
      </div>
    </div>
  );
};