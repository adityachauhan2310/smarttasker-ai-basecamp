import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';

const Chat = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">AI Task Assistant</h1>
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </div>
  );
};

export default Chat; 