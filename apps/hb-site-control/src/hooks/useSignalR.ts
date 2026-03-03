/**
 * Mock SignalR simulation — Foundation Plan Phase 6.
 * setInterval-based event emitter for development.
 * In Phase 7, swap to @microsoft/signalr HubConnection.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface SignalREvent {
  id: string;
  type: 'incident-reported' | 'inspection-complete' | 'alert-cleared' | 'status-update';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
}

interface UseSignalRReturn {
  events: SignalREvent[];
  isConnected: boolean;
  lastEvent: SignalREvent | null;
  clearEvents: () => void;
}

const EVENT_TEMPLATES: Array<Omit<SignalREvent, 'id' | 'timestamp'>> = [
  { type: 'incident-reported', severity: 'high', message: 'Fall hazard reported at Level 3 scaffolding' },
  { type: 'inspection-complete', severity: 'low', message: 'Daily safety inspection completed — Zone A' },
  { type: 'alert-cleared', severity: 'medium', message: 'Confined space entry permit expired — renewed' },
  { type: 'status-update', severity: 'low', message: 'PPE compliance check passed — all crews' },
  { type: 'incident-reported', severity: 'critical', message: 'Electrical hazard flagged near Panel B-12' },
  { type: 'inspection-complete', severity: 'low', message: 'Fire extinguisher inspection complete — Building C' },
  { type: 'alert-cleared', severity: 'medium', message: 'Noise level alert resolved — excavation area' },
  { type: 'status-update', severity: 'low', message: 'Weather advisory acknowledged — high winds expected' },
];

let eventCounter = 0;

function generateEvent(): SignalREvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  eventCounter += 1;
  return {
    ...template,
    id: `evt-${Date.now()}-${eventCounter}`,
    timestamp: new Date().toISOString(),
  };
}

export function useSignalR(intervalMs = 5000): UseSignalRReturn {
  const [events, setEvents] = useState<SignalREvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SignalREvent | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  useEffect(() => {
    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
    }, 500);

    intervalRef.current = setInterval(() => {
      const event = generateEvent();
      setEvents((prev) => [event, ...prev].slice(0, 50));
      setLastEvent(event);
    }, intervalMs);

    return () => {
      clearTimeout(connectTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsConnected(false);
    };
  }, [intervalMs]);

  return { events, isConnected, lastEvent, clearEvents };
}
