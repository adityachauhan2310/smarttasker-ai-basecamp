export type MessageType = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
  isRead?: boolean;
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastReadTimestamp?: string;
}

export interface ChatContextValue {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  markAsRead: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
} 