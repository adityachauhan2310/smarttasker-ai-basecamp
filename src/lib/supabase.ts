
import { createClient } from '@supabase/supabase-js';

// Use the same URL and key as in src/integrations/supabase/client.ts
const supabaseUrl = "https://qoojbxdvdvbwibdkaper.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvb2pieGR2ZHZid2liZGthcGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjM5MzgsImV4cCI6MjA2MTQ5OTkzOH0.goflhN-7kpZYqlqtLbPucScTyYs_40nIqANQpk4Tjj8";

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL schema for creating the tasks management system tables
// Note: This is for reference only, tables should be created through Supabase dashboard
export const tasksSchema = `
-- Table: public.tasks
-- Stores all tasks including one-time tasks and instances of recurring tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique identifier for each task
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the task, links to Supabase auth
  title VARCHAR(255) NOT NULL, -- Task title/name
  description TEXT, -- Detailed task description
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Task status: 'pending', 'in_progress', 'completed', etc.
  priority VARCHAR(20) DEFAULT 'medium', -- Priority level: 'low', 'medium', 'high', 'urgent'
  due_date TIMESTAMPTZ, -- When the task should be completed by
  completed_at TIMESTAMPTZ, -- When the task was actually completed
  estimate_minutes INTEGER, -- Estimated time to complete in minutes
  actual_minutes INTEGER, -- Actual time taken to complete
  original_task_id UUID REFERENCES public.tasks(id), -- For recurring tasks, points to the original task
  tags TEXT[], -- Array of tags/labels
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the task was created
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the task was last updated
  
  -- Enable Row Level Security
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Add RLS policies to restrict access to owner
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tasks" ON public.tasks 
  FOR ALL USING (auth.uid() = user_id);

-- Table: public.task_dependencies
-- Tracks dependencies between tasks (Task A must be completed before Task B)
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the dependency
  dependent_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE, -- The task that depends on another
  prerequisite_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE, -- The task that must be completed first
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent self-dependencies
  CONSTRAINT no_self_dependency CHECK (dependent_task_id != prerequisite_task_id),
  -- Prevent duplicate dependencies
  CONSTRAINT unique_dependency UNIQUE (dependent_task_id, prerequisite_task_id)
);

-- Add RLS policies for dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own task dependencies" ON public.task_dependencies 
  FOR ALL USING (auth.uid() = user_id);

-- Table: public.recurring_tasks
-- Configuration for tasks that repeat at defined intervals
CREATE TABLE public.recurring_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the recurring task
  task_template_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE, -- The task serving as template
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  interval_count INTEGER NOT NULL DEFAULT 1, -- How many units of frequency (e.g., every 2 weeks)
  weekdays INTEGER[], -- For weekly: array of days (0=Sunday, 1=Monday, etc.)
  month_day INTEGER, -- For monthly: day of month (1-31)
  start_date DATE NOT NULL, -- When to start generating instances
  end_date DATE, -- When to stop generating instances (NULL for indefinite)
  max_instances INTEGER, -- Maximum number of instances to create (NULL for indefinite)
  created_instances INTEGER NOT NULL DEFAULT 0, -- Counter to track created instances
  last_generated_date DATE, -- Track the last date we generated tasks up to
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom'))
);

-- Add RLS policies for recurring tasks
ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own recurring task configs" ON public.recurring_tasks 
  FOR ALL USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_original_task_id ON public.tasks(original_task_id);
`;

// Define types for task and filter functions
interface TaskData {
  id?: string;
  user_id?: string;
  title: string;
  description?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  completed_at?: string | null;
  estimate_minutes?: number | null;
  actual_minutes?: number | null;
  original_task_id?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

interface TaskFilters {
  status?: string;
  due_date?: string;
  [key: string]: any; // Allow for additional filter properties
}

// Task management functions
export const createTask = async (taskData: TaskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select();
  
  return { data, error };
};

export const getTasks = async (filters: TaskFilters = {}) => {
  let query = supabase
    .from('tasks')
    .select('*');
  
  // Apply any filters passed
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.due_date) {
    query = query.lte('due_date', filters.due_date);
  }
  
  const { data, error } = await query.order('due_date', { ascending: true });
  return { data, error };
};

export const updateTask = async (id: string, updates: Partial<TaskData>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date()
    })
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  return { error };
};

// Recurring task functions
interface RecurringTaskConfig {
  user_id: string;
  task_template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval_count: number;
  weekdays?: number[] | null;
  month_day?: number | null;
  start_date: string;
  end_date?: string | null;
  max_instances?: number | null;
}

export const createRecurring = async (recurringConfig: RecurringTaskConfig) => {
  const { data, error } = await supabase
    .from('recurring_tasks')
    .insert(recurringConfig)
    .select();
  
  return { data, error };
};

export const getRecurringConfigs = async () => {
  const { data, error } = await supabase
    .from('recurring_tasks')
    .select('*');
  
  return { data, error };
};
