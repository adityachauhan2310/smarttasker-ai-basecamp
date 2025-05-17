import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { Toaster } from "@/components/ui/toaster";
import Router from "@/Router";
import { DemoProvider } from '@/contexts/DemoContext';
import { useEffect } from "react";
import { initializeI18n } from "@/lib/i18n";
import { SettingsProvider } from "@/contexts/SettingsContext";

// Add debug log
console.log("App.tsx module loaded");

const queryClient = new QueryClient();

// Fallback component to display if there's an error
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '20px', margin: '20px', border: '2px solid red', borderRadius: '8px', backgroundColor: '#ffeeee' }}>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4a90e2', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          marginTop: '16px',
          cursor: 'pointer'
        }}
      >
        Reload the app
      </button>
    </div>
  );
}

function AppContent() {
  // Initialize i18n when the app starts
  useEffect(() => {
    console.log("AppContent useEffect running");
    // Initial language setup
    try {
      initializeI18n();
      console.log("i18n initialized successfully");
      
      // Listen for language change events to update components
      const handleLanguageChange = () => {
        // This forces components to re-render with new translations
        console.log('Language changed, applying updates...');
      };
      
      window.addEventListener('languageChanged', handleLanguageChange);
      
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange);
      };
    } catch (error) {
      console.error("Error initializing i18n:", error);
    }
  }, []);

  return (
    <Router />
  );
}

function App() {
  console.log("App component rendering");
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <DemoProvider>
              <SettingsProvider>
                <ChatProvider>
                  <AppContent />
                  <Toaster />
                </ChatProvider>
              </SettingsProvider>
            </DemoProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
