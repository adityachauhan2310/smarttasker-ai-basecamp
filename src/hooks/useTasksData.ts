import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

export function useTasksData() {
  const { isDemo, tasks: demoTasks } = useDemo();
  const { user } = useAuth();

  // Query for all real tasks
  const { data: allTasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user // Only fetch if user is signed in
  });

  if (isDemo && !user) {
    return { tasks: demoTasks as Task[], loading: false, error: null };
  }

  return { tasks: (allTasks as Task[]) || [], loading: isLoading, error };
} 