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
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
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
            <Route path="/client/new" element={<ClientForm />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;