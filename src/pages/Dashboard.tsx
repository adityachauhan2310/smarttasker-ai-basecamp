import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, LineChart, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RecurringTaskGenerator from "@/components/RecurringTaskGenerator";
import ProgressCard from "@/components/dashboard/ProgressCard";
import StatisticsChart from "@/components/dashboard/StatisticsChart";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ChatWidget from "@/components/dashboard/ChatWidget";
import NewTaskDialog from "@/components/NewTaskDialog";
import { NotificationBell } from "@/components/NotificationBell";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';
import { useTasksData } from '@/hooks/useTasksData';
import { useToast } from "@/components/ui/use-toast";
import { t } from "@/lib/i18n";

// Track notifications that have already been shown to avoid duplicates
const notifiedTaskIds = new Set<string>();

const Dashboard = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { tasks, loading } = useTasksData();
  const { isDemo, tasks: demoTasks } = useDemo();
  const { user } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  // Function to check tasks that are due soon
  const checkDueTasks = () => {
    // Check if task reminders are enabled
    const notificationPrefs = localStorage.getItem('notificationPreferences');
    if (!notificationPrefs) return;
    
    const { taskReminders } = JSON.parse(notificationPrefs);
    if (!taskReminders) return;
    
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);
    
    const dueTasks = tasks.filter(task => {
      // Skip already notified tasks
      if (notifiedTaskIds.has(task.id)) return false;
      
      // Skip tasks that don't have a due date or are already completed
      if (!task.dueDate || task.status === 'done') return false;
      
      const dueDate = new Date(task.dueDate);
      
      // Task is either overdue or due within the next 10 minutes
      return dueDate <= tenMinutesFromNow;
    });
    
    // Show notifications for due tasks
    dueTasks.forEach(task => {
      // Mark this task as notified so we don't show it again
      notifiedTaskIds.add(task.id);
      
      // Show toast notification
      toast({
        title: `Task ${new Date(task.dueDate) < now ? 'Overdue' : 'Due Soon'}`,
        description: task.title,
        variant: "destructive",
      });
      
      // Show browser notification if permissions are granted
      if (Notification.permission === 'granted') {
        new Notification(`Task ${new Date(task.dueDate) < now ? 'Overdue' : 'Due Soon'}`, {
          body: task.title,
          icon: '/favicon.ico'
        });
      }
    });
  };
  
  // Set up notification interval and request permissions
  useEffect(() => {
    // Request notification permissions on first render if not already granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Check for due tasks immediately
    checkDueTasks();
    
    // Set up interval to check for due tasks every minute
    const interval = window.setInterval(checkDueTasks, 60000);
    intervalRef.current = interval;
    
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [tasks]);

  // Calculate task statistics
  const tasksStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    upcoming: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    }).length
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <div className="flex items-center gap-2">
          <NotificationBell tasks={tasks} />
          <Button onClick={() => setIsNewTaskDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("newTask")}
          </Button>
        </div>
      </div>

      {isDemo && !user && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{t("viewingDemoVersion")}</p>
        </div>
      )}

      {/* Empty state for real users with no tasks */}
      {user && tasks.length === 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p>{t("noTasksYet")}</p>
        </div>
      )}

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalTasks")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksStats.total}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("completed")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tasksStats.completed}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("upcoming")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{tasksStats.upcoming}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("overdue")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{tasksStats.overdue}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ProgressCard 
            title="Weekly Progress" 
            value={14} 
            maxValue={24} 
            category="Tasks" 
          />

          <ProgressCard 
            title="Project Completion" 
            value={65} 
            maxValue={100} 
            category="Overall" 
          />
          
          <div className="grid grid-cols-2 gap-6">
            <ProfileCard 
              name="John Doe" 
              role="Team Lead" 
              status="online" 
              stats={{
                tasksCompleted: 3,
                tasksInProgress: 2
              }}
            />
            <ProfileCard 
              name="Jane Smith" 
              role="Developer" 
              status="away" 
              stats={{
                tasksCompleted: 5,
                tasksInProgress: 3
              }}
            />
          </div>
        </div>
        
        <StatisticsChart title="Task Progress" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecurringTaskGenerator />
        <ChatWidget />
      </div>

      <NewTaskDialog 
        open={isNewTaskDialogOpen} 
        onOpenChange={setIsNewTaskDialogOpen} 
      />
    </div>
  );
};

export default Dashboard;
