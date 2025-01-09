import { Routes, Route } from 'react-router-dom';
import { CRMDashboard } from './components/crm/CRMDashboard';
import { ClientDetails } from './components/crm/client-details/ClientDetails';
import { Login } from './pages/Login';
import { CalendarView } from './components/calendar/CalendarView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CRMDashboard />} />
      <Route path="/client/:id" element={<ClientDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/calendar/:clientId" element={<CalendarView />} />
      <Route path="/calendar" element={<CalendarView />} />
    </Routes>
  );
}