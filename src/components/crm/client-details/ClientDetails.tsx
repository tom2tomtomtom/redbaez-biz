import { useParams } from 'react-router-dom';
import { ClientContent } from './ClientContent';
import { ClientForm } from '../client-form/ClientForm';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { useClientData } from './hooks/useClientData';

export const ClientDetails = () => {
  const { id } = useParams();
  
  // If we're on the "new" route, render the client form
  if (id === 'new') {
    return <ClientForm />;
  }

  // Convert id to number for existing clients
  const clientId = parseInt(id || '', 10);
  
  // Validate client ID
  if (isNaN(clientId)) {
    return <ErrorState message="Invalid client ID" />;
  }

  const { data: client, isLoading, error } = useClientData(clientId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!client) {
    return <ErrorState message="Client not found" />;
  }

  return <ClientContent client={client} />;
};