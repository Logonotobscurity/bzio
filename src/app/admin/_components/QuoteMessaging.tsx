'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  message: string;
  senderEmail: string;
  senderName?: string;
  senderRole: 'customer' | 'admin';
  createdAt: string;
  isRead: boolean;
}

interface QuoteMessagingProps {
  quoteId: string;
  quoteReference: string;
  customerEmail: string;
  onClose?: () => void;
}

export function QuoteMessaging({
  quoteId,
  quoteReference,
  customerEmail,
  onClose,
}: QuoteMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/admin/quote-messages?quoteId=${quoteId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [quoteId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/admin/quote-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          message: newMessage,
          senderRole: 'admin',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages - Quote {quoteReference}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{customerEmail}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderRole === "ADMIN" ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderRole === "ADMIN"
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium">{msg.senderName || msg.senderEmail}</p>
                    <p className="text-sm mt-1">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {format(new Date(msg.createdAt), 'MMM dd, HH:mm')}
                    </p>
                    {!msg.isRead && msg.senderRole === "ADMIN" && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Unread
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
