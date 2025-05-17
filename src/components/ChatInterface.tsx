import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';

const ChatInterface = () => {
  const { state, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state.isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  return (
    <Card className="flex flex-col h-[70vh] w-full max-w-2xl mx-auto bg-[rgba(30,41,59,0.85)] backdrop-blur-md rounded-2xl shadow-2xl border border-primary/10 animate-fade-in-up transition-all duration-500">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="font-semibold text-lg">Chat</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full px-4 py-1 bg-muted/60 hover:bg-primary/80 hover:text-white transition-colors duration-300 shadow"
          onClick={clearChat}
        >
          Clear Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col mb-4 ${
                message.role === 'user' ? 'items-end' : 'items-start'
              } animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 shadow-md transition-all duration-300 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/80 text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
          {state.isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {state.error && (
            <div className="text-destructive text-center py-2">
              {state.error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex items-center gap-2 bg-background/80 rounded-b-2xl"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={state.isLoading}
          className="flex-1 focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all duration-300 bg-background/80 rounded-lg"
        />
        <Button
          type="submit"
          size="icon"
          disabled={state.isLoading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatInterface; 