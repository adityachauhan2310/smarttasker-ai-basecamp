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
                <p className="text-sm text-muted-foreground">
                  {t('connectToSupabase')}
                </p>
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
                {t('manageAccountPrefs')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('language')}</Label>
                <select 
                  id="language"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={preferences.language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">{t('english')}</option>
                  <option value="es">{t('spanish')}</option>
                  <option value="fr">{t('french')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t('timezone')}</Label>
                <select 
                  id="timezone"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={preferences.timezone}
                  onChange={handleTimezoneChange}
                >
                  <option value="utc">{t('utc')}</option>
                  <option value="est">{t('est')}</option>
                  <option value="pst">{t('pst')}</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccountPreferences}>
                {t('saveChanges')}
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
