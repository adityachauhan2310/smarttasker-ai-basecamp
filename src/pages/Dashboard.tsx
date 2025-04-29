
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, LineChart, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RecurringTaskGenerator from "@/components/RecurringTaskGenerator";
import ProgressCard from "@/components/dashboard/ProgressCard";
import StatisticsChart from "@/components/dashboard/StatisticsChart";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ChatWidget from "@/components/dashboard/ChatWidget";
import { motion } from "framer-motion";

const Dashboard = () => {
  // This will be populated from Supabase once integrated
  const [tasks, setTasks] = useState({
    total: 24,
    completed: 14,
    upcoming: 7,
    overdue: 3
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button className="gradient-bg hover:opacity-90 transition-opacity">
          <PlusCircle className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

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
              <div className="text-2xl font-bold">{tasks.total}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tasks.completed}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{tasks.upcoming}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{tasks.overdue}</div>
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
              taskCount={5} 
            />
            <ProfileCard 
              name="Jane Smith" 
              role="Developer" 
              status="busy" 
              taskCount={8} 
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

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
