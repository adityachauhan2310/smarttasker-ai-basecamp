import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { t } from "@/lib/i18n";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, forceUpdate] = useState({});
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render to update translations
      forceUpdate({});
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 md:hidden flex items-center px-4 border-b">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">{t("appName")}</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
