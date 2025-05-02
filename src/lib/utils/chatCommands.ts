import { Task } from '@/types/task';

export type ChatCommand = {
  command: string;
  description: string;
  handler: (args: string, context: ChatCommandContext) => Promise<string>;
};

export type ChatCommandContext = {
  tasks: Task[];
  userId: string;
  createTask?: (task: Partial<Task>) => Promise<void>;
  updateTask?: (taskId: string, updates: Partial<Task>) => Promise<void>;
};

const chatCommands: Record<string, ChatCommand> = {
  '/help': {
    command: '/help',
    description: 'Show available commands',
    handler: async () => {
      const commandList = Object.values(chatCommands)
        .map(cmd => `${cmd.command} - ${cmd.description}`)
        .join('\n');
      return `Available commands:\n${commandList}`;
    }
  },
  '/tasks': {
    command: '/tasks',
    description: 'List all your tasks',
    handler: async (_, context) => {
      if (!context.tasks.length) {
        return 'You have no tasks yet. Use /create-task to create one!';
      }
      
      const taskList = context.tasks
        .map(task => `• ${task.title} (${task.status})`)
        .join('\n');
      return `Your tasks:\n${taskList}`;
    }
  },
  '/create-task': {
    command: '/create-task',
    description: 'Create a new task. Usage: /create-task <title>',
    handler: async (args, context) => {
      if (!args.trim()) {
        return 'Please provide a task title. Usage: /create-task <title>';
      }
      
      if (!context.createTask) {
        return 'Task creation is not available right now.';
      }
      
      try {
        await context.createTask({
          title: args,
          user_id: context.userId,
          status: 'pending',
          priority: 'medium'
        });
        return `✅ Created task: ${args}`;
      } catch (error) {
        return `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  },
  '/due-today': {
    command: '/due-today',
    description: 'Show tasks due today',
    handler: async (_, context) => {
      const today = new Date().toISOString().split('T')[0];
      const dueTasks = context.tasks.filter(
        task => task.due_date?.startsWith(today)
      );
      
      if (!dueTasks.length) {
        return 'No tasks due today! 🎉';
      }
      
      const taskList = dueTasks
        .map(task => `• ${task.title} (${task.status})`)
        .join('\n');
      return `Tasks due today:\n${taskList}`;
    }
  },
  '/overdue': {
    command: '/overdue',
    description: 'Show overdue tasks',
    handler: async (_, context) => {
      const today = new Date().toISOString();
      const overdueTasks = context.tasks.filter(
        task => task.due_date && task.due_date < today && task.status !== 'completed'
      );
      
      if (!overdueTasks.length) {
        return 'No overdue tasks! Keep up the good work! 🎉';
      }
      
      const taskList = overdueTasks
        .map(task => `• ${task.title} (due: ${new Date(task.due_date!).toLocaleDateString()})`)
        .join('\n');
      return `Overdue tasks:\n${taskList}`;
    }
  }
};

export const processCommand = async (
  message: string,
  context: ChatCommandContext
): Promise<string | null> => {
  const [command, ...args] = message.trim().split(' ');
  const handler = chatCommands[command];
  
  if (!handler) {
    return null;
  }
  
  return await handler.handler(args.join(' '), context);
};

export const isCommand = (message: string): boolean => {
  return message.trim().startsWith('/');
};

export default chatCommands; 