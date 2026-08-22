import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Riders from './pages/Riders';
import Orders from './pages/Orders';
import Revenue from './pages/Revenue';
import Services from './pages/Services';
import Promotions from './pages/Promotions';
import Verifications from './pages/Verifications';
import Support from './pages/Support';
import Settings from './pages/Settings';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="riders" element={<Riders />} />
              <Route path="orders" element={<Orders />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="services" element={<Services />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="verifications" element={<Verifications />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              <Route path="login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </ToastProvider>
  );
}

