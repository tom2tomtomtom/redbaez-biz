import React, { useState } from 'react';
import { ClientForm } from './client-form/ClientForm';
import { IntelSearch } from './intel-search/IntelSearch';
import { ClientSearch } from './client-search/ClientSearch';
import { BusinessSummary } from './business-summary/BusinessSummary';
import { CalendarView } from '../calendar/CalendarView';

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

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
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