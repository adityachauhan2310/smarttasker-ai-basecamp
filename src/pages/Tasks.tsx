
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, AlertCircle, CheckCircle, XCircle, ArrowUpCircle, Clock } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import RecurringTaskGenerator from "@/components/RecurringTaskGenerator";
import { supabase } from "@/integrations/supabase/client";
import NewTaskDialog from "@/components/NewTaskDialog";
import TaskDependencyBadge from "@/components/TaskDependencyBadge";
import { format } from "date-fns";

const Tasks = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Function to fetch tasks with dependencies
  const fetchTasks = async (filter = {}) => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, dependencies:task_dependencies!dependent_task_id(prerequisite_task_id)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Fetch blocking tasks details for each task
    const tasksWithDependencies = await Promise.all(tasks.map(async (task) => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return { ...task, blockingTasks: [] };
      }
      
      const prerequisiteIds = task.dependencies.map(d => d.prerequisite_task_id);
      
      const { data: blockingTasks, error: blockingError } = await supabase
        .from('tasks')
        .select('id, title, status')
        .in('id', prerequisiteIds);
        
      if (blockingError) throw blockingError;
      
      return { ...task, blockingTasks: blockingTasks || [] };
    }));
    
    return tasksWithDependencies;
  };

  // Query for all tasks
  const { data: allTasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => fetchTasks()
  });
  
  // Helper function to filter tasks
  const filterTasks = (tasks, filter) => {
    if (!tasks) return [];
    
    switch(filter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate < tomorrow && task.status !== 'completed';
        });
        
      case 'upcoming':
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate > currentDate && task.status !== 'completed';
        });
        
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
        
      case 'recurring':
        return tasks.filter(task => task.original_task_id !== null);
        
      default:
        return tasks;
    }
  };
  
  // Priority assignment mutation
  const prioritizeMutation = useMutation({
    mutationFn: async (taskId) => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('You must be logged in to prioritize tasks');
      }
      
      const response = await supabase.functions.invoke('prioritize-tasks', {
        body: { taskId },
        headers: { 
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task prioritized",
        description: `"${data.task.title}" is now ${data.task.priority} priority`,
      });
    },
    onError: (error) => {
      console.error('Error prioritizing task:', error);
      toast({
        title: "Error prioritizing task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Status update mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Check if task is blocked
  const isTaskBlocked = (task) => {
    if (!task.blockingTasks) return false;
    return task.blockingTasks.some(bt => bt.status !== 'completed');
  };

  // Render task table
  const renderTaskTable = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a new task to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Dependencies</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.status === 'completed' ? 'outline' :
                        task.status === 'in_progress' ? 'default' :
                        'secondary'
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' :
                        'outline'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {task.blockingTasks && task.blockingTasks.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.blockingTasks.map(blockingTask => (
                          <TaskDependencyBadge 
                            key={blockingTask.id}
                            task={blockingTask}
                          />
                        ))}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {task.status !== 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatusMutation.mutate({ 
                              id: task.id, 
                              status: 'completed' 
                            })}
                            disabled={isTaskBlocked(task)}
                            title={isTaskBlocked(task) ? "Complete blocking tasks first" : "Mark as complete"}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => prioritizeMutation.mutate(task.id)}
                            title="Auto-prioritize this task"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Button 
          className="gradient-bg hover:opacity-90 transition-opacity" 
          onClick={() => setIsNewTaskDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : renderTaskTable(allTasks)}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : renderTaskTable(filterTasks(allTasks, 'today'))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : renderTaskTable(filterTasks(allTasks, 'upcoming'))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : renderTaskTable(filterTasks(allTasks, 'completed'))}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Recurring Task Configurations</h3>
                <Table>
                  <TableCaption>Your recurring task configurations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Next</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p>No recurring tasks configured yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <RecurringTaskGenerator />
          </div>
        </TabsContent>
      </Tabs>

      <NewTaskDialog 
        open={isNewTaskDialogOpen} 
        onOpenChange={setIsNewTaskDialogOpen}
        allTasks={allTasks || []}
      />
    </div>
  );
};

export default Tasks;
