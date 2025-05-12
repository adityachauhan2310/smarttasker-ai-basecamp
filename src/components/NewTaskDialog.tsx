import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseTaskFromText } from "@/lib/nlp";
import { suggestTagsFromContent } from '@/lib/categorization';
import { detectPriorityFromText } from '@/lib/priorityDetection';
import { estimateTimeFromContent } from '@/lib/timeEstimation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Define form schema
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  due_date: z.date().optional().nullable(),
  dependencies: z.array(z.string()).default([])
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTasks?: Array<{ id: string; title: string; status: string; }>;
}

const NewTaskDialog = ({ open, onOpenChange, allTasks = [] }: NewTaskDialogProps) => {
  // Initialize form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      due_date: null,
      dependencies: []
    }
  });

  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [dependencySearchOpen, setDependencySearchOpen] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const queryClient = useQueryClient();
  const [showTagSuggestions, setShowTagSuggestions] = useState(true);
  const [dueTime, setDueTime] = useState('');
  const [showTimeEstimate, setShowTimeEstimate] = useState(false);
  const titleValue = form.watch('title');
  const descriptionValue = form.watch('description');
  const timeEstimate = estimateTimeFromContent(`${titleValue} ${descriptionValue || ''}`);
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      try {
        // Get the current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error('You must be logged in to create tasks');

        // First create the new task
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert({
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            status: values.status,
            due_date: values.due_date ? values.due_date.toISOString() : null,
            user_id: session.user.id  // Add the user_id from the session
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Then create any dependencies
        if (values.dependencies.length > 0 && newTask) {
          const dependencyPromises = values.dependencies.map(prerequisiteId => 
            supabase
              .from('task_dependencies')
              .insert({
                dependent_task_id: newTask.id,
                prerequisite_task_id: prerequisiteId,
                user_id: session.user.id  // Add the user_id from the session
              })
          );
          
          await Promise.all(dependencyPromises);
        }
        
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
      toast({
        title: "Task created",
        description: "Your new task has been created successfully.",
      });
      form.reset();
      setSelectedDependencies([]);
      setDueTime('');
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: TaskFormValues) => {
    createTaskMutation.mutate(values);
  };
  
  // Filter out completed tasks from dependencies
  const availableDependencies = allTasks.filter(task => task.status !== 'completed');
  
  // Handle removing a dependency
  const removeDependency = (id: string) => {
    const newDependencies = form.getValues("dependencies").filter(dep => dep !== id);
    form.setValue("dependencies", newDependencies);
    setSelectedDependencies(newDependencies);
  };

  // Helper to clean up title
  function cleanTitle(title: string) {
    return title.replace(/[-–—]+/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+([.,!?:;])/g, '$1');
  }

  // Only parse and fill form when user clicks button or presses Enter
  const handleQuickAddParse = () => {
    if (quickAddText.trim()) {
      const parsedTask = parseTaskFromText(quickAddText);
      console.log('Quick Add input:', quickAddText);
      console.log('Parsed task:', parsedTask);
      form.setValue("title", cleanTitle(parsedTask.title));
      if (parsedTask.dueDate) {
        form.setValue("due_date", new Date(parsedTask.dueDate));
      }
      if (parsedTask.priority) {
        form.setValue("priority", parsedTask.priority);
      }
    }
  };

  // Compute tag suggestions based on title and description
  const tagSuggestions = showTagSuggestions
    ? suggestTagsFromContent(`${titleValue} ${descriptionValue || ''}`)
    : [];

  // Priority suggestion based on title and description
  const prioritySuggestion = detectPriorityFromText(`${titleValue} ${descriptionValue || ''}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task with details and dependencies.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-8">
            <div className="space-y-2">
              <Label htmlFor="quickAdd">Quick Add</Label>
              <div className="flex gap-2">
                <Input
                  id="quickAdd"
                  placeholder="Type a task like 'Buy groceries tomorrow high priority'"
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAddParse();
                    }
                  }}
                />
                <Button type="button" onClick={handleQuickAddParse} variant="secondary">
                  Fill Form
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Type a natural language description of your task. Click "Fill Form" or press Enter to parse and fill the form below.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or fill out the form below
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description (optional)" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Estimate Section */}
            <div className="mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-2 py-0 text-xs text-muted-foreground hover:text-primary"
                onClick={() => setShowTimeEstimate(v => !v)}
                aria-expanded={showTimeEstimate}
              >
                {showTimeEstimate ? 'Hide' : 'Show'} time estimate
              </Button>
              {showTimeEstimate && (
                <div className="mt-1 text-xs text-muted-foreground border rounded px-2 py-1 bg-muted">
                  <span>Estimated time: </span>
                  <span className="font-semibold">{timeEstimate}</span>
                </div>
              )}
            </div>
            
            {/* Tag Suggestions UI */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>Suggested tags:</span>
                {tagSuggestions.map(tag => (
                  <span key={tag} className="bg-muted px-2 py-0.5 rounded-full border border-border">
                    {tag}
                  </span>
                ))}
                <button
                  type="button"
                  className="ml-2 underline text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setShowTagSuggestions(false)}
                  tabIndex={-1}
                >
                  Hide suggestions
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Priority Suggestion UI */}
                    {prioritySuggestion && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Suggested:</span>
                        <span className={
                          prioritySuggestion === 'high' ? 'bg-destructive text-destructive-foreground' :
                          prioritySuggestion === 'medium' ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'
                        + ' px-2 py-0.5 rounded-full border border-border font-semibold'}>
                          {prioritySuggestion.charAt(0).toUpperCase() + prioritySuggestion.slice(1)}
                        </span>
                        <span className="text-muted-foreground">(AI suggestion)</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <div className="flex flex-row gap-2 w-full items-end">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={date => {
                            // If a time is already selected, combine date and time
                            if (date && dueTime) {
                              const [hours, minutes] = dueTime.split(":").map(Number);
                              date.setHours(hours);
                              date.setMinutes(minutes);
                            }
                            field.onChange(date);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-col w-40">
                      <Label htmlFor="dueTime">Time</Label>
                      <Input
                        id="dueTime"
                        type="time"
                        value={dueTime}
                        onChange={e => {
                          setDueTime(e.target.value);
                          // If a date is already selected, update its time
                          if (field.value && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":").map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            field.onChange(newDate);
                          }
                        }}
                        className="mt-1"
                        style={{ maxWidth: 160 }}
                      />
                    </div>
                  </div>
                  <FormDescription>
                    Optional due date and time for this task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dependencies"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dependencies (Blocking Tasks)</FormLabel>
                  <Popover 
                    open={dependencySearchOpen} 
                    onOpenChange={setDependencySearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          Select blocking tasks
                          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search tasks..." />
                        <CommandList>
                          <CommandEmpty>No tasks found.</CommandEmpty>
                          <CommandGroup>
                            {availableDependencies.map((task) => (
                              <CommandItem
                                key={task.id}
                                value={task.title}
                                onSelect={() => {
                                  const currentDeps = field.value || [];
                                  const newDeps = currentDeps.includes(task.id)
                                    ? currentDeps.filter(id => id !== task.id)
                                    : [...currentDeps, task.id];
                                  
                                  field.onChange(newDeps);
                                  setSelectedDependencies(newDeps);
                                }}
                              >
                                {task.title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Display selected dependencies */}
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map(depId => {
                        const task = allTasks.find(t => t.id === depId);
                        if (!task) return null;
                        
                        return (
                          <Badge 
                            key={depId} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <span>{task.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => removeDependency(depId)}
                            >
                              <span>×</span>
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  <FormDescription>
                    Select tasks that need to be completed before this one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setQuickAddText("");
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
