'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

interface ProjectChatProps {
  projectId: string;
  companyId: string;
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
}

export function ProjectChat({  }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      _id: '1',
      senderId: 'company',
      senderName: 'Company Rep',
      content: 'Welcome to the project! Let me know if you have any questions.',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      _id: '2',
      senderId: 'freelancer',
      senderName: 'You',
      content: 'Thanks! I\'ll review the requirements and get back to you.',
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      _id: Date.now().toString(),
      senderId: 'freelancer',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-start gap-3 ${message.senderId === 'freelancer' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === 'freelancer'
                    ? 'bg-primary-600 text-white'
                    : 'bg-charcoal-100 text-charcoal-950'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}