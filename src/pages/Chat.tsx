import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] items-center justify-center bg-background transition-colors duration-500">
      <h1 className="text-3xl font-bold mb-6 animate-fade-in-down">AI Task Assistant</h1>
      <ChatInterface />
    </div>
  );
};

export default Chat; 