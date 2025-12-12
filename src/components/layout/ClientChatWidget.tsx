
'use client';

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ChatWidget = dynamic(() => import('@/components/chat-widget').then(mod => mod.ChatWidget), {
  loading: () => <div className="fixed right-4 bottom-4 w-40 h-12"><Skeleton className="w-full h-full rounded-full" /></div>,
  ssr: false
});

export function ClientChatWidget() {
  return <ChatWidget />;
}
