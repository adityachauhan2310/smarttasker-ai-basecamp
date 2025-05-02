import { useState } from "react";
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
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';
import { useTasksData } from '@/hooks/useTasksData';

const Dashboard = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { tasks, loading } = useTasksData();
  const { isDemo, tasks: demoTasks } = useDemo();
  const { user } = useAuth();
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => setIsNewTaskDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      {isDemo && !user && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>You are viewing the demo version with sample data.</p>
        </div>
      )}

      {/* Empty state for real users with no tasks */}
      {user && tasks.length === 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p>You have no tasks yet. Click "New Task" to get started!</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksStats.total}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tasksStats.completed}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{tasksStats.upcoming}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
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
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{String.fromCharCode(65 + i)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User {String.fromCharCode(65 + i)}</p>
                    <p className="text-xs text-muted-foreground">
                      {i % 2 === 0 ? "Completed task" : "Created new task"} {Math.floor(Math.random() * 30) + 1} minutes ago
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todoTasks.map(task => (
                <div key={task.id} className="p-2 border rounded">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inProgressTasks.map(task => (
                <div key={task.id} className="p-2 border rounded">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Done</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doneTasks.map(task => (
                <div key={task.id} className="p-2 border rounded">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        allTasks={tasks}
      />
    </div>
  );
};

export default Dashboard;
