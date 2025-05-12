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

const queryClient = new QueryClient();

function AppContent() {
  // Initialize i18n when the app starts
  useEffect(() => {
    // Initial language setup
    initializeI18n();
    
    // Listen for language change events to update components
    const handleLanguageChange = () => {
      // This forces components to re-render with new translations
      console.log('Language changed, applying updates...');
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <Router />
  );
}

function App() {
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
