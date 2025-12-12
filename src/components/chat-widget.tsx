'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizonal, X, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import styles from './chat-widget.module.css';

// Chat Icon Component
const ChatIcon = () => (
  <svg 
    version="1.1" 
    id="Layer_1" 
    xmlns="http://www.w3.org/2000/svg" 
    x="0" 
    y="0" 
    viewBox="0 0 32 32" 
    className={`animate-vibrate ${styles.chatIconSvg}`}
    xmlSpace="preserve" 
    aria-hidden="true"
  >
    <style>{'.st1{fill:orange}'}</style>
    <path className="st1" d="M29 23c-.125 0-.251-.023-.372-.071-1.829-.732-3.596-1.908-5.251-3.494a1 1 0 1 1 1.385-1.443c.814.78 1.654 1.447 2.512 1.994a34.804 34.804 0 0 1-.888-3.81 1.001 1.001 0 0 1 .313-.911C28.183 13.92 29 12.229 29 10.5 29 6.364 24.514 3 19 3S9 6.364 9 10.5c0 .122.004.242.012.362a1 1 0 0 1-.933 1.063c-.557.016-1.027-.382-1.063-.933A7.284 7.284 0 0 1 7 10.5C7 5.262 12.383 1 19 1s12 4.262 12 9.5c0 2.13-.901 4.19-2.549 5.856.564 2.957 1.469 5.25 1.478 5.273a.998.998 0 0 1-.223 1.078A.998.998 0 0 1 29 23z"/>
    <path className="st1" d="M3 31a1 1 0 0 1-.93-1.37c.01-.023.914-2.316 1.478-5.273C1.901 22.689 1 20.63 1 18.5 1 13.262 6.383 9 13 9s12 4.262 12 9.5S19.617 28 13 28c-1.478 0-2.922-.214-4.305-.636-1.677 1.623-3.465 2.821-5.324 3.564A.98.98 0 0 1 3 31zm10-20c-5.514 0-10 3.364-10 7.5 0 1.728.817 3.42 2.301 4.765.253.23.372.573.313.911a34.651 34.651 0 0 1-.888 3.811c1.024-.653 2.021-1.477 2.983-2.462a1 1 0 0 1 1.05-.244c1.348.477 2.775.719 4.241.719 5.514 0 10-3.364 10-7.5S18.514 11 13 11z"/>
    <path className={styles.chatIconPath} d="M6 19.5a1 1 0 0 1-1-1c0-2.656 3.215-5.5 8-5.5a1 1 0 1 1 0 2c-3.663 0-6 2.073-6 3.5a1 1 0 0 1-1 1z"/>
  </svg>
);

// Welcome Screen Component
const WelcomeScreen = ({ setInput }: { setInput: (value: string) => void }) => (
  <div className="space-y-3">
    <div className="text-center mb-4">
      <h3 className="font-semibold text-slate-900">Welcome to BZION Support</h3>
      <p className="text-sm text-slate-600">How can we help you today?</p>
    </div>
    <div className="space-y-2">
      {[
        "Tell me about your products",
        "I need pricing information",
        "How do I place an order?",
        "Track my order status"
      ].map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => setInput(suggestion)}
          className="w-full p-2 text-left text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

// Chat Message Component
const ChatMessage = ({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) => (
  <div className={cn("flex", role === 'user' ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        "max-w-xs px-3 py-2 rounded-lg text-sm",
        role === 'user'
          ? 'bg-primary text-white rounded-br-none'
          : 'bg-slate-100 text-slate-900 rounded-bl-none'
      )}
    >
      {children}
    </div>
  </div>
);

// Chat Input Component
const ChatInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn(
      "flex-1 resize-none bg-transparent outline-none text-sm",
      className
    )}
    rows={1}
    aria-label="Chat message input"
  />
);

export function ChatWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id?: string; role: 'user' | 'assistant'; display: React.ReactNode}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure component is mounted before rendering (hydration safety)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      display: input
    }]);
    setInput('');
    setError(null);

    // Simulate AI response (replace with actual API call)
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `${Date.now()}-response`,
        role: 'assistant',
        display: 'Thanks for your message! Our team will get back to you shortly.'
      }]);
      setIsLoading(false);
    }, 500);
  }, [input]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <div className="fixed right-3 bottom-4 md:right-4 md:bottom-6 lg:right-6 lg:bottom-8 z-50 safe-area-inset-bottom">
        <Button
          onClick={() => setChatOpen(!isChatOpen)}
          className="h-14 w-14 sm:h-16 sm:w-16 md:h-16 md:w-16 p-0 rounded-full shadow-lg border-2 border-white bg-primary text-white hover:bg-primary/90 hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Open chat"
          aria-expanded={isChatOpen}
        >
          <ChatIcon />
        </Button>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setChatOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] sm:max-w-md rounded-t-2xl flex flex-col p-0 mx-auto"
        >
          <SheetHeader className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>BZION Support</SheetTitle>
                <SheetDescription>AI-powered assistance available 24/7</SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
                className="h-8 w-8"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-slate-50">
            <div className="p-4 space-y-3">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {messages.length === 0 ? (
                <WelcomeScreen setInput={setInput} />
              ) : (
                messages.map((m, i) => (
                  <ChatMessage key={m.id || i} role={m.role}>
                    {m.display}
                  </ChatMessage>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-900 p-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 bg-slate-400 rounded-full animate-bounce ${styles.typingBubbleBase}`} />
                      <div className={`w-2 h-2 bg-slate-400 rounded-full animate-bounce ${styles.typingBubbleDelay1}`} />
                      <div className={`w-2 h-2 bg-slate-400 rounded-full animate-bounce ${styles.typingBubbleDelay2}`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="flex items-end gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  placeholder="Ask a question..."
                  className="px-2 py-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-500 text-xs text-center">
                BZION AI may produce inaccurate information. Always verify important details.
              </p>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
