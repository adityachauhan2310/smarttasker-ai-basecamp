import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Task } from '@/types/task';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'reminder' | 'system' | 'overdue';
  taskId?: string;
}

interface NotificationBellProps {
  tasks: Task[];
}

export function NotificationBell({ tasks }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Generate notifications from tasks
  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const newNotifications: NotificationItem[] = [];
    
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
    
    // Add overdue task notifications
    overdueTasks.forEach(task => {
      newNotifications.push({
        id: `overdue-${task.id}`,
        title: t('overdueTask'),
        message: task.title,
        timestamp: new Date(),
        read: false,
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
        read: false,
        type: 'reminder',
        taskId: task.id
      });
    });
    
    // Add a system notification if needed (example)
    if (tasks.length > 0 && tasks.filter(t => t.status === 'done').length === 0) {
      newNotifications.push({
        id: 'sys-1',
        title: t('productivityTip'),
        message: t('completeYourFirstTask'),
        timestamp: new Date(),
        read: false,
        type: 'system'
      });
    }
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [tasks]);

  // Mark all notifications as read when dropdown is opened
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    }
  };

  // Navigate to notifications page
  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  // Format relative time for notifications
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t('daysAgo')}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>{t('notifications')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer py-3 px-4 flex flex-col items-start">
                <div className="flex w-full justify-between">
                  <span className="font-medium">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer justify-center"
          onClick={handleViewAllNotifications}
        >
          {t('viewAllNotifications')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 