import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { applyLanguage, t } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import { useTheme } from "@/components/theme-provider";
import { SunIcon, MoonIcon } from "lucide-react";

interface NotificationPreferences {
  taskReminders: boolean;
  emailNotifications: boolean;
}

const Settings = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    taskReminders: false,
    emailNotifications: false
  });
  const { toast } = useToast();
  const { preferences, setLanguage, setTimezone, savePreferences, readableTimezone, forceRefresh } = useSettings();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Could not fetch user.');
        setLoading(false);
        return;
      }
      setEmail(user.email || '');
      // Fetch profile from 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      if (profileError) {
        setError('Could not fetch profile.');
      } else {
        setName(profile?.name || '');
      }
      setLoading(false);
    };
    fetchProfile();
    
    // Load notification preferences from localStorage
    const savedNotificationPrefs = localStorage.getItem('notificationPreferences');
    if (savedNotificationPrefs) {
      try {
        const prefs = JSON.parse(savedNotificationPrefs) as NotificationPreferences;
        setNotificationPrefs(prefs);
      } catch (e) {
        console.error('Failed to parse saved notification preferences');
      }
    }

    // Listen for language change events to refresh the UI
    const handleLanguageChange = () => {
      // Force a re-render by updating a state variable
      setMessage(t("preferencesUpdated"));
      setTimeout(() => setMessage(""), 3000);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Could not fetch user.');
      setLoading(false);
      return;
    }
    // Upsert profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name });
    if (upsertError) {
      setError('Failed to update profile.');
    } else {
      setMessage('Profile updated successfully.');
    }
    setLoading(false);
  };

  const handleSaveAccountPreferences = () => {
    try {
      // Save preferences through our context
      savePreferences();
      
      // Force-apply new language to the UI immediately
      applyLanguage();
      
      // Force context refresh to update all components using the context
      forceRefresh();
      
      // Update toast with translated text after language change
      toast({
        title: t("success"),
        description: t("preferencesUpdated"),
      });
      
      // Force re-render of the current component
      setMessage(t("preferencesUpdated"));
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorSavingPreferences"),
      });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimezone(e.target.value as 'utc' | 'est' | 'pst');
  };

  const handleSavePreferences = () => {
    try {
      // Save notification preferences to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));
      
      // Request notification permission if taskReminders is enabled
      if (notificationPrefs.taskReminders && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications enabled",
              description: "You will receive notifications for upcoming tasks",
            });
          }
        });
      }
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving preferences",
        description: "There was a problem saving your preferences",
      });
    }
  };

  const handleReloadApp = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('manageAccountPrefs')}
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">{t('profileInformation')}</TabsTrigger>
          <TabsTrigger value="account">{t('accountSettings')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notificationPreferences')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInformation')}</CardTitle>
              <CardDescription>
                {t('updatePersonalInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" placeholder={t('yourName')} value={name} onChange={e => setName(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" placeholder={t('yourEmail')} type="email" value={email} disabled />
              </div>
              {message && <div className="text-green-600 text-sm">{message}</div>}
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? t('saving') : t('saveChanges')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('accountSettings')}</CardTitle>
              <CardDescription>
                {t('manageAccountSettings')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                      <div className="space-y-1 w-full">
                        <Label htmlFor="language" className="font-medium">{t('language')}</Label>
                        <select 
                          id="language" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={preferences.language}
                          onChange={handleLanguageChange}
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div className="space-y-1 w-full">
                        <Label htmlFor="timezone" className="font-medium">{t('timezone')}</Label>
                        <select 
                          id="timezone" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={preferences.timezone}
                          onChange={handleTimezoneChange}
                        >
                          <option value="utc">UTC</option>
                          <option value="est">EST (UTC-5)</option>
                          <option value="pst">PST (UTC-8)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{t('appearance')}</h3>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <span className="relative inline-flex items-center">
                          <span className={`transition-transform duration-300 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} text-yellow-400`}><SunIcon className="h-6 w-6" /></span>
                          <span className={`transition-transform duration-300 absolute left-0 ${theme === 'dark' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} text-blue-400`}><MoonIcon className="h-6 w-6" /></span>
                        </span>
                        <Label htmlFor="theme-toggle" className="font-medium">{t('darkMode')}</Label>
                      </div>
                      <button
                        id="theme-toggle"
                        type="button"
                        aria-pressed={theme === 'dark'}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none border-2 border-primary/40
                          ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 shadow-[0_0_16px_2px_rgba(59,130,246,0.3)]' : 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500 shadow-[0_0_12px_2px_rgba(253,224,71,0.25)]'}
                          hover:scale-105 hover:shadow-lg`}
                      >
                        <span
                          className={`absolute top-1/2 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300
                            ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}
                            border-2 border-primary/30
                          `}
                          style={{ transform: `translateY(-50%) ${theme === 'dark' ? 'translateX(2rem)' : 'translateX(0)'}` }}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? t('darkModeEnabled') : t('lightModeEnabled')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveAccountPreferences} className="px-6 py-2 text-base font-semibold rounded-lg shadow-md">
                {t('saveSettings')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationPreferences')}</CardTitle>
              <CardDescription>
                {t('controlNotifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('receiveViaEmail')}
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={notificationPrefs.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">{t('taskReminders')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('getRemindedTasks')}
                  </p>
                </div>
                <Switch 
                  id="task-reminders" 
                  checked={notificationPrefs.taskReminders}
                  onCheckedChange={(checked) => 
                    setNotificationPrefs(prev => ({ ...prev, taskReminders: checked }))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>
                {t('savePreferences')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
