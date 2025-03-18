
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Marketing } from './pages/Marketing';
import { Partnerships } from './pages/Partnerships';
import { ProductDevelopment } from './pages/ProductDevelopment';
import Index from './pages/Index';
import { BusinessAdmin } from './pages/BusinessAdmin';
import { AiNews } from './pages/AiNews';
import { ClientDetails } from './components/crm/client-details/ClientDetails';
import { ThemeProvider } from './hooks/use-theme';
import { ClientForm } from './components/crm/client-form/ClientForm';
import { ErrorBoundary } from './components/ui/error-boundary';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Set global staleTime to 0 to always fetch fresh data
      gcTime: 1000 * 60, // Keep data in cache for 1 minute after it becomes unused
      retry: 1,
      refetchOnWindowFocus: true, // Refetch when window gets focus
      refetchOnMount: true, // Refetch when component mounts
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="/product-development" element={<ProductDevelopment />} />
              <Route path="/ai-news" element={<AiNews />} />
              <Route path="/business-admin" element={<BusinessAdmin />} />
              <Route path="/client/:id" element={<ClientDetails />} />
              <Route 
                path="/client/new" 
                element={
                  <ClientForm
                    contacts={[]}
                    nextSteps=""
                    nextDueDate=""
                    onContactsChange={() => {}}
                    onNextStepsChange={() => {}}
                    onNextDueDateChange={() => {}}
                  />
                } 
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
