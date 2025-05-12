import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, AlertTriangle, Info, Calendar } from "lucide-react";
import { t } from "@/lib/i18n";
import { Task } from "@/types/task";
import { useTasksData } from "@/hooks/useTasksData";

// Define notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'reminder' | 'system' | 'overdue';
  taskId?: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { tasks } = useTasksData();

  // Generate notifications from tasks
  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const newNotifications: Notification[] = [];
    
    // Find overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return new Date(task.dueDate) < now;
    });
    
    // Find tasks due today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= todayStart && dueDate <= todayEnd;
    });
    
    // Find tasks due this week (next 7 days)
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate > todayEnd && dueDate <= weekEnd;
    });
    
    // Add overdue task notifications
    overdueTasks.forEach(task => {
      newNotifications.push({
        id: `overdue-${task.id}`,
        title: t('overdueTask'),
        message: task.title,
        timestamp: new Date(),
        type: 'overdue',
        taskId: task.id
      });
    });
    
    // Add today's task notifications
    todayTasks.forEach(task => {
      newNotifications.push({
        id: `today-${task.id}`,
        title: t('dueTodayTask'),
        message: task.title,
        timestamp: new Date(),
        type: 'reminder',
        taskId: task.id
      });
    });
    
    // Add this week's task notifications
    weekTasks.forEach(task => {
      newNotifications.push({
        id: `week-${task.id}`,
        title: t('dueThisWeek'),
        message: task.title,
        timestamp: new Date(),
        type: 'reminder',
        taskId: task.id
      });
    });
    
    // Add system notifications
    newNotifications.push({
      id: 'sys-1',
      title: t('productivityTip'),
      message: t('completeYourFirstTask'),
      timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
      type: 'system'
    });
    
    if (tasks.filter(t => t.status === 'done').length > 0) {
      newNotifications.push({
        id: 'sys-2',
        title: t('achievementUnlocked'),
        message: t('completedFirstTask'),
        timestamp: new Date(now.getTime() - 7200000), // 2 hours ago
        type: 'system'
      });
    }
    
    newNotifications.push({
      id: 'sys-3',
      title: t('welcomeToSmartTasker'),
      message: t('getStartedMessage'),
      timestamp: new Date(now.getTime() - 86400000), // 1 day ago
      type: 'system'
    });
    
    // Sort notifications by timestamp (newest first)
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setNotifications(newNotifications);
  }, [tasks]);

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return t('today') + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return t('yesterday') + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    return notifications.filter(notification => notification.type === activeTab);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Count notifications by type
  const reminderCount = notifications.filter(n => n.type === 'reminder').length;
  const overdueCount = notifications.filter(n => n.type === 'overdue').length;
  const systemCount = notifications.filter(n => n.type === 'system').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('notifications')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allNotifications')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all" className="flex items-center justify-center gap-2">
                <Bell className="h-4 w-4" />
                <span>{t('all')}</span>
                <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reminder" className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('reminders')}</span>
                <Badge variant="secondary" className="ml-1">{reminderCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{t('overdue')}</span>
                <Badge variant="secondary" className="ml-1">{overdueCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                <span>{t('system')}</span>
                <Badge variant="secondary" className="ml-1">{systemCount}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {getFilteredNotifications().length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>{t('noNotificationsInCategory')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredNotifications().map(notification => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        {notification.taskId && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {t('relatedTask')}: {notification.taskId}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage; 