import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import NotificationsPage from "@/pages/NotificationsPage";
import TestPage from "@/pages/TestPage";

// Debug component
const DebugScreen = ({ name, error = null }: { name: string; error?: any }) => (
  <div className="debug-info" style={{ padding: '20px', margin: '20px', border: '1px solid blue' }}>
    <h2>Debug: {name}</h2>
    {error && (
      <div style={{ color: 'red' }}>
        <h3>Error:</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )}
  </div>
);

function Router() {
  console.log("Router component rendering...");
  
  try {
    const { user, loading } = useAuth();
    const { isDemo } = useDemo();
    
    console.log("Router auth status:", { user: !!user, loading, isDemo });

    // Loading screen while auth state is being determined
    if (loading) {
      console.log("Router showing loading screen");
      return (
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-xl">Loading...</span>
        </div>
      );
    }

    // Protected route wrapper
    const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
      console.log("ProtectedRoute rendering with:", { user: !!user, isDemo });
      if (!user && !isDemo) {
        console.log("ProtectedRoute redirecting to /auth");
        return <Navigate to="/auth" replace />;
      }
      return <>{children}</>;
    };

    // Public route wrapper - redirects if user is already authenticated
    const PublicRoute = ({ children }: { children: React.ReactNode }) => {
      console.log("PublicRoute rendering with:", { user: !!user, isDemo });
      if (user || isDemo) {
        console.log("PublicRoute redirecting to /dashboard");
        return <Navigate to="/dashboard" replace />;
      }
      return <>{children}</>;
    };

    console.log("Router preparing to render routes");
    
    return (
      <Routes>
        {/* Test route for debugging */}
        <Route path="/test" element={<TestPage />} />
        
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
          <Route index element={<Navigate to="/test" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/test" replace />} />
      </Routes>
    );
  } catch (error) {
    console.error("Error in Router component:", error);
    return <DebugScreen name="Router Error" error={error} />;
  }
}

export default Router; 