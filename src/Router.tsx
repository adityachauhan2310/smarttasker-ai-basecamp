import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import NotificationsPage from "@/pages/NotificationsPage";

function Router() {
  const { user, loading } = useAuth();

  // Loading screen while auth state is being determined
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading...</span>
      </div>
    );
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  // Public route wrapper - redirects if user is already authenticated
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Router; 