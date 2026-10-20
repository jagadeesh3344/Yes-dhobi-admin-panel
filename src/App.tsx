import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { GoLiveLaunchpad } from './components/GoLiveLaunchpad';
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
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Admin Workspace Error">
      <ToastProvider>
        <DataProvider>
          <Router>
            <Routes>
              {/* Standalone client demo and ceremony routes */}
              <Route
                path="/launch"
                element={
                  <GoLiveLaunchpad
                    onEnterDashboard={() => {
                      sessionStorage.setItem('yd_has_gone_live', 'true');
                      window.location.href = '/';
                    }}
                  />
                }
              />
              <Route
                path="/go-live"
                element={
                  <GoLiveLaunchpad
                    onEnterDashboard={() => {
                      sessionStorage.setItem('yd_has_gone_live', 'true');
                      window.location.href = '/';
                    }}
                  />
                }
              />

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
    </ErrorBoundary>
  );
}

