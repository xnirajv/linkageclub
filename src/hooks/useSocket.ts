import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface UseSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  error: Error | null;
  send: (data: any) => void;
  connect: () => void;
  disconnect: () => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
}

export function useSocket(
  url?: string,
  options: UseSocketOptions = {}
): UseSocketReturn {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
  } = options;

  const { data: session } = useSession();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reconnectCount = useRef(0);
  const eventHandlers = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const getSocketUrl = useCallback(() => {
    if (url) return url;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, [url]);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const socketUrl = getSocketUrl();
      const ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;

        // Send authentication token if available
        if (session?.user) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: session.user.id,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handlers = eventHandlers.current.get(message.type);
          
          if (handlers) {
            handlers.forEach(handler => handler(message.data));
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        socketRef.current = null;

        // Attempt reconnection
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          console.log(`Attempting reconnection ${reconnectCount.current}/${reconnectAttempts}`);
          
          setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [getSocketUrl, session, reconnect, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event)!.add(handler);
  }, []);

  const off = useCallback((event: string, handler: (data: any) => void) => {
    const handlers = eventHandlers.current.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventHandlers.current.delete(event);
      }
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    send,
    connect,
    disconnect,
    on,
    off,
  };
}

export default useSocket;