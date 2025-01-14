import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Marketing } from './pages/Marketing';
import { Partnerships } from './pages/Partnerships';
import { ProductDevelopment } from './pages/ProductDevelopment';
import Index from './pages/Index';
import { BusinessAdmin } from './pages/BusinessAdmin';
import { AiNews } from './pages/AiNews';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/product-development" element={<ProductDevelopment />} />
        <Route path="/ai-news" element={<AiNews />} />
        <Route path="/business-admin" element={<BusinessAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;