import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Flights } from './pages/Flights';
import { Weather } from './pages/Weather';
import { Students } from './pages/Students';
import { Instructors } from './pages/Instructors';
import { Calendar } from './pages/Calendar';

// Students route component - only accessible to ADMIN and INSTRUCTOR
function StudentsRoute() {
  const { user } = useAuthStore();
  
  if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Layout>
      <Students />
    </Layout>
  );
}

// Instructors route component - only accessible to ADMIN
function InstructorsRoute() {
  const { user } = useAuthStore();
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Layout>
      <Instructors />
    </Layout>
  );
}

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/flights"
          element={
            <ProtectedRoute>
              <Layout>
                <Flights />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Layout>
                <Weather />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsRoute />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/instructors"
          element={
            <ProtectedRoute>
              <InstructorsRoute />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

