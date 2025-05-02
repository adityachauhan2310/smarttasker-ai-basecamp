import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import MainLayout from '@/components/layout/MainLayout';
import Auth from '@/components/Auth';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Settings from '@/pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemo } = useDemo();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, disable demo mode
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated and not in demo mode, redirect to auth
  if (!isDemo) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow access in demo mode
  return <>{children}</>;
}

export default function AppRoutes() {
  const { user } = useAuth();
  const { isDemo } = useDemo();

  return (
    <Routes>
      <Route
        path="/auth"
        element={user || isDemo ? <Navigate to="/dashboard" /> : <Auth />}
      />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 