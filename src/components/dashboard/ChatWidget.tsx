
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<{type: 'user' | 'ai'; content: string}[]>([
    { type: 'ai', content: 'Hello! How can I assist you today?' }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    
    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', content: userMessage }]);
    
    // Simulate AI reply (in a real app, this would make an API call)
    setTimeout(() => {
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: "I'm a simulated AI assistant. In the future, I'll connect to ChatGPT or Groq API!" 
      }]);
    }, 1000);
  };

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
            className="fixed bottom-4 right-4 z-50 w-80 rounded-lg bg-card border shadow-xl overflow-hidden flex flex-col"
            style={{ height: isMinimized ? '48px' : '400px' }}
            initial={{ opacity: 0, y: 20, height: '48px' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: isMinimized ? '48px' : '400px'
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="p-3 border-b bg-primary text-primary-foreground flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="flex gap-1">
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
            
            {/* Chat conversation */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                  <AnimatePresence>
                    {conversation.map((msg, index) => (
                      <motion.div
                        key={index}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          {msg.type === 'ai' && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div 
                            className={`py-2 px-3 rounded-lg text-sm ${
                              msg.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Chat input */}
                <div className="p-3 border-t bg-card">
                  <form 
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Input 
                      placeholder="Type your message..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
