'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface CommunicationTabProps {
  project: any;
}

export function CommunicationTab({ project }: CommunicationTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/applications/${project._id}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || data.data?.messages || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [project._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const tempMessage: Message = {
      _id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch(`/api/applications/${project._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempMessage.content }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
        toast.error('Failed to send message');
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? { ...m, read: false } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
          ' ' +
          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
          {(project?.candidate?.name || 'C')[0]}
        </div>
        <div>
          <p className="font-medium text-sm">{project?.candidate?.name || 'Candidate'}</p>
          <p className="text-xs text-gray-500">
            {project?.title || 'Project'} • Trust: {project?.candidate?.trustScore || 'N/A'}%
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-400 text-lg mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation with your candidate.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === 'me';
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMine ? 'order-1' : ''}`}>
                  {!isMine && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                      {msg.senderName} • {formatTime(msg.createdAt)}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  {isMine && (
                    <p className="text-xs text-gray-500 mt-1 mr-1 text-right flex items-center justify-end gap-1">
                      {formatTime(msg.createdAt)}
                      {msg.read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-end gap-2">
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Paperclip className="h-5 w-5 text-gray-400" />
        </Button>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}