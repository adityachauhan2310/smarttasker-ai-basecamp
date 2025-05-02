import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastReadTimestamp: Date;
}

export interface ChatContextValue {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  markMessagesAsRead: () => void;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_LAST_READ'; payload: Date };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  lastReadTimestamp: new Date(),
};

async function fetchTasks() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const tasks = await fetchTasks();
    
    // If no tasks are found, provide a generic response
    if (tasks.length === 0) {
      return "I don't see any tasks in your list yet. Would you like help creating a new task?";
    }

    const today = new Date();
    
    // Process tasks data
    const dueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate >= today;
    });
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const upcomingTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate > today && task.status !== 'completed';
    });

    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate < today && task.status !== 'completed';
    });

    // Create a response based on the user's message and task context
    const taskSummary = `You have ${tasks.length} tasks in total:
- ${completedTasks.length} completed
- ${upcomingTasks.length} upcoming
- ${overdueTasks.length} overdue`;

    // Simple response generation based on keywords
    if (userMessage.toLowerCase().includes('overdue')) {
      return overdueTasks.length > 0
        ? `You have ${overdueTasks.length} overdue tasks. Here they are:\n${overdueTasks
            .map(task => `- ${task.title} (due: ${new Date(task.due_date).toLocaleDateString()})`)
            .join('\n')}`
        : "Great news! You don't have any overdue tasks.";
    }

    if (userMessage.toLowerCase().includes('upcoming')) {
      return upcomingTasks.length > 0
        ? `Here are your upcoming tasks:\n${upcomingTasks
            .map(task => `- ${task.title} (due: ${new Date(task.due_date).toLocaleDateString()})`)
            .join('\n')}`
        : "You don't have any upcoming tasks scheduled.";
    }

    if (userMessage.toLowerCase().includes('completed')) {
      return completedTasks.length > 0
        ? `Here are your completed tasks:\n${completedTasks
            .map(task => `- ${task.title}`)
            .join('\n')}`
        : "You haven't completed any tasks yet.";
    }

    // Default response with task summary
    return `${taskSummary}\n\nHow can I help you manage your tasks?`;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble accessing your task information. Please try again in a moment.";
  }
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_LAST_READ':
      return {
        ...state,
        lastReadTimestamp: action.payload,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        isLoading: false,
        error: null,
        lastReadTimestamp: new Date(),
      };
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(content);
      
      // Add AI message
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to generate response. Please try again.' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  const markMessagesAsRead = useCallback(() => {
    dispatch({ type: 'SET_LAST_READ', payload: new Date() });
  }, []);

  const value = {
    state,
    sendMessage,
    clearChat,
    markMessagesAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 