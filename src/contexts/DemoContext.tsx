import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

type DemoTask = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
};

type DemoContextType = {
  isDemo: boolean;
  tasks: DemoTask[];
  setDemoMode: (isDemo: boolean) => void;
};

const sampleTasks: DemoTask[] = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    description: 'Draft and finalize the project proposal document',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-03-20',
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    title: 'Team Meeting',
    description: 'Weekly team sync meeting',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-03-18',
    createdAt: '2024-03-15',
  },
  {
    id: '3',
    title: 'Review Code Changes',
    description: 'Review and approve pull requests',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-03-19',
    createdAt: '2024-03-15',
  },
  {
    id: '4',
    title: 'Update Documentation',
    description: 'Update API documentation',
    status: 'done',
    priority: 'low',
    dueDate: '2024-03-17',
    createdAt: '2024-03-15',
  },
];

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  tasks: [],
  setDemoMode: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [tasks] = useState<DemoTask[]>(sampleTasks);
  const { user } = useAuth();

  // Disable demo mode if user signs in
  useEffect(() => {
    if (user) {
      setIsDemo(false);
    }
  }, [user]);

  const setDemoMode = (demoMode: boolean) => {
    // Only allow enabling demo mode if user is not authenticated
    if (!user) {
      setIsDemo(demoMode);
    }
  };

  return (
    <DemoContext.Provider value={{ isDemo, tasks, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  return useContext(DemoContext);
}; 