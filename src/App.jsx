import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import FullMenu from './pages/FullMenu';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Billing from './pages/Billing';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/full-menu" element={<FullMenu />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/menu" 
            element={
              <ProtectedRoute adminOnly>
                <MenuManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
