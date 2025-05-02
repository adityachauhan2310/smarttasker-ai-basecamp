-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimate_minutes INTEGER,
  actual_minutes INTEGER,
  original_task_id UUID REFERENCES public.tasks(id),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Add RLS policies to restrict access to owner
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tasks" ON public.tasks 
  FOR ALL USING (auth.uid() = user_id);

-- Table: public.task_dependencies
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dependent_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT no_self_dependency CHECK (dependent_task_id != prerequisite_task_id),
  CONSTRAINT unique_dependency UNIQUE (dependent_task_id, prerequisite_task_id)
);

-- Add RLS policies for dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own task dependencies" ON public.task_dependencies 
  FOR ALL USING (auth.uid() = user_id);

-- Table: public.recurring_tasks
CREATE TABLE public.recurring_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_template_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL,
  interval_count INTEGER NOT NULL DEFAULT 1,
  weekdays INTEGER[],
  month_day INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  max_instances INTEGER,
  created_instances INTEGER NOT NULL DEFAULT 0,
  last_generated_date DATE,
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