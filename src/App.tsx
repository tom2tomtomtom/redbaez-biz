import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ClientDetails } from '@/components/crm/client-details/ClientDetails';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import './App.css';

// Create a client outside of the component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<CRMDashboard />} />
            <Route path="/client/:id" element={<ClientDetails />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;