'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useApplication, useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/forms/Textarea';

type CompanyApplication = {
  _id: string;
  status?: string;
  applicantId?: { name?: string };
  projectId?: { title?: string };
  jobId?: { title?: string };
};

export default function MessagesPage() {
  const { applications = [], isLoading, sendMessage } = useApplications({ role: 'company', limit: 100 });
  const typedApplications = applications as CompanyApplication[];
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { getMessages } = useApplication(selectedId);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const conversations = useMemo(() => {
    return typedApplications.filter((application) => application._id);
  }, [typedApplications]);

  useEffect(() => {
    if (!selectedId && conversations[0]?._id) {
      setSelectedId(conversations[0]._id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    let active = true;

    const loadMessages = async () => {
      if (!selectedId) {
        setMessages([]);
        return;
      }

      setMessagesLoading(true);
      const data = await getMessages();
      if (active) {
        setMessages(data || []);
        setMessagesLoading(false);
      }
    };

    void loadMessages();

    return () => {
      active = false;
    };
  }, [getMessages, selectedId]);

  const selectedConversation = conversations.find((item) => item._id === selectedId);

  const handleSend = async () => {
    if (!selectedId || !draft.trim() || sending) {
      return;
    }

    setSending(true);
    setStatus(null);
    const result = await sendMessage(selectedId, draft.trim());
    if (!result.success) {
      setStatus({ type: 'error', message: result.error || 'Failed to send message.' });
    } else {
      setDraft('');
      setStatus({ type: 'success', message: 'Message sent.' });
      const updated = await getMessages();
      setMessages(updated || []);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Messages</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Continue conversations with applicants and keep project communication in one place.</p>
      </div>

      {status && (
        <div className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <div className="rounded-[22px] bg-silver-50/70 p-4 text-sm text-charcoal-500">Loading conversations...</div>}
            {!isLoading && conversations.length === 0 && (
              <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-6 text-sm text-charcoal-500">
                Messages will appear here once candidates apply and the conversation starts.
              </div>
            )}
            {conversations.map((application) => {
              const title = application.projectId?.title || application.jobId?.title || 'Opportunity';
              const active = application._id === selectedId;
              return (
                <button
                  key={application._id}
                  type="button"
                  onClick={() => setSelectedId(application._id)}
                  className={`w-full rounded-[22px] border p-4 text-left transition ${active ? 'border-primary-700 bg-primary-50' : 'border-primary-100/70 bg-silver-50/70 dark:border-white/10 dark:bg-charcoal-950/35'}`}
                >
                  <div className="font-semibold text-charcoal-950 dark:text-white">{application.applicantId?.name || 'Candidate'}</div>
                  <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{title}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">Status: {application.status || 'pending'}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">
              {selectedConversation ? `${selectedConversation.applicantId?.name || 'Candidate'} • ${selectedConversation.projectId?.title || selectedConversation.jobId?.title || 'Opportunity'}` : 'Message Thread'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedConversation && (
              <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500">
                Select a conversation to start messaging.
              </div>
            )}
            {selectedConversation && (
              <>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {messagesLoading && <div className="rounded-[22px] bg-silver-50/70 p-4 text-sm text-charcoal-500">Loading messages...</div>}
                  {!messagesLoading && messages.length === 0 && (
                    <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-sm text-charcoal-500">
                      No messages yet. Send the first update.
                    </div>
                  )}
                  {!messagesLoading && messages.map((message, index) => (
                    <div key={`${message.id || message._id || index}`} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-charcoal-950 dark:text-white">{message.sender?.name || 'User'}</div>
                        <div className="text-xs text-charcoal-500 dark:text-charcoal-400">
                          {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-charcoal-700 dark:text-charcoal-300">{message.content}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-charcoal-900 dark:text-white">
                    <MessageSquare className="h-4 w-4 text-primary-700" />
                    Reply
                  </div>
                  <Textarea rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type your message..." />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleSend} disabled={!draft.trim() || sending}>
                      <Send className="mr-2 h-4 w-4" />
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
