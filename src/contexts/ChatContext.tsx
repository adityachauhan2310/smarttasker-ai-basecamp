import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';
import { createGroqClient } from '@/lib/groqClient';
import { createTask } from '@/lib/supabase';
import { parseTaskFromText } from '@/lib/nlp';

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
      // If the user asks for the count of completed tasks
      if (
        userMessage.toLowerCase().includes('how many') ||
        userMessage.toLowerCase().includes('how much') ||
        userMessage.toLowerCase().includes('count') ||
        userMessage.toLowerCase().match(/\bnumber\b/)
      ) {
        return `You have completed ${completedTasks.length} tasks so far.`;
      }
      // Otherwise, show the list
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

// Utility to extract JSON from a string (handles markdown/code blocks)
function extractJsonFromString(str: string): string | null {
  const match = str.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
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

const groqClient = createGroqClient({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

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
      // Prompt for Groq
      const prompt = `You are a smart task assistant. When a user sends a message, respond in this JSON format:\n{\n  "action": "create_task" | "list_tasks" | "other",\n  "task": {\n    "title": "...",\n    "due_date": "...",\n    "priority": "low" | "medium" | "high"\n  },\n  "response": "A friendly message to the user."\n}\nIf the user wants to create a task, fill in the task fields. If not, set action to "other".\nUser message: ${content}`;
      let groqResult;
      try {
        groqResult = await groqClient.generateCompletion(prompt, { temperature: 0.2, maxTokens: 300 });
      } catch (groqError) {
        console.error('Groq API error:', groqError);
        dispatch({ type: 'SET_ERROR', payload: 'Groq API error. Please check your API key and network.' });
        return;
      }
      console.log('Groq raw response:', groqResult.content);
      let groqJson;
      try {
        const jsonStr = extractJsonFromString(groqResult.content);
        if (!jsonStr) throw new Error('No JSON found in Groq response');
        groqJson = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Groq JSON parse error:', e, groqResult.content);
        // fallback to NLP if Groq response is not valid JSON
        const parsed = parseTaskFromText(content);
        if (parsed.title) {
          // Try to create a task with fallback NLP
          let data, error;
          try {
            ({ data, error } = await createTask({
              title: parsed.title,
              priority: parsed.priority || 'medium',
              due_date: parsed.dueDate ? new Date(parsed.dueDate).toISOString() : null,
              status: 'pending',
              description: '',
            }));
          } catch (supabaseError) {
            console.error('Supabase error (NLP fallback):', supabaseError);
            dispatch({ type: 'SET_ERROR', payload: 'Supabase error. Please check your connection and authentication.' });
            return;
          }
          let response = error ? 'Failed to create task.' : `Task "${parsed.title}" created!`;
          const aiMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
          return;
        } else {
          // fallback to generic response
          const aiMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: "Sorry, I couldn't understand your request.",
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
          return;
        }
      }

      if (groqJson.action === 'create_task' && groqJson.task && groqJson.task.title) {
        // Create the task in Supabase
        let data, error;
        let dueDateValue = null;
        if (groqJson.task.due_date) {
          const parsedDate = new Date(groqJson.task.due_date);
          if (!isNaN(parsedDate.getTime())) {
            dueDateValue = parsedDate.toISOString();
          } else {
            // Try to parse a date from the user message using NLP
            const nlpParsed = parseTaskFromText(content);
            if (nlpParsed.dueDate) {
              const nlpDate = new Date(nlpParsed.dueDate);
              if (!isNaN(nlpDate.getTime())) {
                dueDateValue = nlpDate.toISOString();
              } else {
                dueDateValue = null;
              }
            } else {
              dueDateValue = null;
            }
          }
        }
        let userId = null;
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData?.session?.user?.id) {
            throw new Error('User not authenticated. Please sign in.');
          }
          userId = sessionData.session.user.id;
        } catch (authError) {
          console.error('Supabase auth error:', authError);
          dispatch({ type: 'SET_ERROR', payload: 'You must be signed in to create tasks.' });
          return;
        }
        try {
          ({ data, error } = await createTask({
            title: groqJson.task.title,
            priority: groqJson.task.priority || 'medium',
            due_date: dueDateValue,
            status: 'pending',
            description: '',
            user_id: userId,
          }));
        } catch (supabaseError) {
          console.error('Supabase error (Groq intent):', supabaseError);
          dispatch({ type: 'SET_ERROR', payload: 'Supabase error. Please check your connection and authentication.' });
          return;
        }
        let response;
        if (error) {
          console.error('Supabase createTask error:', error);
          response = error.message || 'Failed to create task.';
        } else {
          response = groqJson.response ? groqJson.response + '\nTask "' + groqJson.task.title + '" created!' : `Task "${groqJson.task.title}" created!`;
        }
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      } else {
        // Default: reply with Groq's response
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
          content: groqJson.response || groqResult.content,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Unexpected error. Please check the console for details.' 
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