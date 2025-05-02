import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2, Maximize2, Loader2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { processCommand, isCommand } from '@/lib/utils/chatCommands';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const { tasks, createTask, updateTask } = useTasks();
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error,
    clearError,
    markAsRead,
    addReaction,
    removeReaction
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle chat with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Toggle search with Cmd/Ctrl + F when chat is open
      if (isOpen && (e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearching(prev => !prev);
        if (!isSearching) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSearching]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isLoading) return;

    const content = message.trim();
    setMessage('');

    if (isCommand(content)) {
      const response = await processCommand(content, {
        tasks,
        userId: user?.id || '',
        createTask,
        updateTask
      });
      
      if (response) {
        // Add system message with command response
        await sendMessage(response);
      }
    } else {
      await sendMessage(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <motion.div 
          className="fixed bottom-4 right-4 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Button 
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full gradient-bg shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-4 right-4 z-50 w-96 rounded-lg bg-card border shadow-xl overflow-hidden flex flex-col"
            style={{ height: isMinimized ? '48px' : '600px' }}
            initial={{ opacity: 0, y: 20, height: '48px' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: isMinimized ? '48px' : '600px'
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="p-3 border-b bg-primary text-primary-foreground flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="font-medium">AI Assistant</span>
                {error && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={clearError}
                  >
                    {error}
                  </Button>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search bar */}
            <AnimatePresence>
              {!isMinimized && isSearching && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b"
                >
                  <div className="p-2">
                    <Input
                      ref={searchInputRef}
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chat messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {filteredMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onReaction={(emoji) => addReaction(msg.id, emoji)}
                      onRemoveReaction={(emoji) => removeReaction(msg.id, emoji)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Chat input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type a message or try /help${isLoading ? '...' : ''}`}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading || !message.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
