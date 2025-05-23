import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  X,
  LogIn,
  LogOut,
  MessageSquare,
  Bell
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    {
      name: t("dashboard"),
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("tasks"),
      path: "/tasks",
      icon: CheckSquare,
    },
    {
      name: t("notifications"),
      path: "/notifications",
      icon: Bell,
    },
    {
      name: t("chat"),
      path: "/chat",
      icon: MessageSquare,
    },
    {
      name: t("settings"),
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="font-bold text-white">ST</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="px-2 pt-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive(item.path)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4">
            {user ? (
              <div className="space-y-4">
                <div className="px-2 py-2 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t("signOut")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/auth">
                  <LogIn className="mr-2 h-5 w-5" />
                  {t("signIn")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
