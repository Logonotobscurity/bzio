'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const DEBUG = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_DEBUG === 'true' || false);

export interface RealtimeMessage {
  type: 'form_submission' | 'quote_request' | 'new_user' | 'newsletter_signup' | 'checkout' | 'ping' | 'pong';
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface RealtimeUpdate {
  formSubmissions?: number;
  quotes?: number;
  users?: number;
  newsletter?: number;
  activities?: Record<string, unknown>[];
}

interface UseRealtimeOptions {
  onUpdate?: (update: RealtimeUpdate) => void;
  onMessage?: (message: RealtimeMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error | Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    onUpdate,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'disconnected'>('disconnected');

  // Connect to Server-Sent Events (SSE) endpoint
  const connect = useCallback(() => {
    try {
      tryWebSocket();
    } catch {
      if (DEBUG) console.warn('[REALTIME] WebSocket unavailable, using polling');
      setupPolling();
    }
  }, []);

  // Try WebSocket connection
  const tryWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/realtime`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (DEBUG) console.log('[REALTIME] WebSocket connected');
        setIsConnected(true);
        setConnectionType('websocket');
        reconnectCountRef.current = 0;
        onConnect?.();

        // Send initial ping
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        }

        // Set up ping interval (every 30 seconds)
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
          }
        }, 30000);

        ws.addEventListener('close', () => clearInterval(pingInterval));
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          if (DEBUG) console.log('[REALTIME] WebSocket message:', message.type);
          onMessage?.(message);
          handleMessage(message);
        } catch (error) {
          console.error('[REALTIME] Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (event) => {
        if (DEBUG) {
          console.error('[REALTIME] WebSocket error:', {
            type: event.type,
            readyState: ws.readyState,
            url: ws.url,
          });
        }
        onError?.(event);
        // Fallback to polling on error
        setupPolling();
      };

      ws.onclose = () => {
        if (DEBUG) console.log('[REALTIME] WebSocket disconnected');
        setIsConnected(false);
        setConnectionType('disconnected');
        onDisconnect?.();

        // Attempt reconnect
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current++;
          if (DEBUG) console.log(`[REALTIME] Reconnecting (${reconnectCountRef.current}/${maxReconnectAttempts})...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectCountRef.current);
        }
      };

      eventSourceRef.current = null; // Clear any SSE connection
    } catch (error) {
      if (DEBUG) {
        console.warn('[REALTIME] WebSocket connection failed, using polling');
      }
      onError?.(error instanceof Error ? error : new Error(String(error)));
      setupPolling();
    }
  }, [onConnect, onDisconnect, onError, onMessage, reconnectInterval, maxReconnectAttempts, connect]);

  // Fallback: Set up polling strategy
  const setupPolling = useCallback(() => {
    if (DEBUG) console.log('[REALTIME] Using polling strategy for updates (10s intervals)');
    setIsConnected(true);
    setConnectionType('polling');
    onConnect?.();

    // Poll every 10 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/dashboard-data', {
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (response.ok) {
          // Polling successful - data will be updated via the hook consumer
          const message: RealtimeMessage = {
            type: 'ping',
            timestamp: new Date().toISOString(),
          };
          onMessage?.(message);
        }
      } catch (error) {
        console.error('[REALTIME] Polling error:', error);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [onConnect, onMessage]);

  // Handle message processing
  const handleMessage = (message: RealtimeMessage) => {
    switch (message.type) {
      case 'form_submission':
        onUpdate?.({ formSubmissions: 1 });
        break;
      case 'quote_request':
        onUpdate?.({ quotes: 1 });
        break;
      case 'new_user':
        onUpdate?.({ users: 1 });
        break;
      case 'newsletter_signup':
        onUpdate?.({ newsletter: 1 });
        break;
      case 'checkout':
        onUpdate?.({ formSubmissions: 1 });
        break;
    }
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send message (for WebSocket only)
  const send = useCallback(() => {
    // This would only work with WebSocket
    // For now, we don't support sending messages in polling mode
    if (DEBUG) console.log('[REALTIME] Send not supported in current mode');
  }, []);

  return {
    isConnected,
    connectionType,
    send,
    reconnect: connect,
  };
}
