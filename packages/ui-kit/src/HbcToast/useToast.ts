/**
 * HbcToastProvider + useToast hook — Phase 4.9
 * Reference: PH4.9-UI-Design-Plan.md §9
 *
 * Imperative toast API via React context.
 * V2.1: success (auto-dismiss 3s), error (manual), sync-status (programmatic).
 */
import * as React from 'react';
import type {
  ToastConfig,
  ToastEntry,
  ToastContextValue,
  ToastCategory,
  HbcToastProviderProps,
} from './types.js';

let nextId = 0;
const genId = () => `hbc-toast-${++nextId}`;

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <HbcToastProvider>');
  return ctx;
};

/** Internal context for the portal renderer to access toast state */
export interface ToastInternalState {
  toasts: ToastEntry[];
  dismissToast: (id: string) => void;
  maxVisible: number;
}

const ToastInternalContext = React.createContext<ToastInternalState | null>(null);
export const useToastInternal = (): ToastInternalState | null =>
  React.useContext(ToastInternalContext);

export const HbcToastProvider: React.FC<HbcToastProviderProps> = ({
  children,
  maxVisible = 3,
}) => {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissCategory = React.useCallback((category: ToastCategory) => {
    setToasts((prev) => {
      const removed = prev.filter((t) => t.category === category);
      removed.forEach((t) => {
        const timer = timersRef.current.get(t.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(t.id);
        }
      });
      return prev.filter((t) => t.category !== category);
    });
  }, []);

  const addToast = React.useCallback(
    (config: ToastConfig): string => {
      const id = genId();
      const entry: ToastEntry = { ...config, id };
      setToasts((prev) => [...prev, entry]);

      if (config.category === 'success') {
        const timer = setTimeout(() => dismissToast(id), 3000);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({ addToast, dismissToast, dismissCategory }),
    [addToast, dismissToast, dismissCategory],
  );

  const internal = React.useMemo<ToastInternalState>(
    () => ({ toasts, dismissToast, maxVisible }),
    [toasts, dismissToast, maxVisible],
  );

  return React.createElement(
    ToastContext.Provider,
    { value },
    React.createElement(ToastInternalContext.Provider, { value: internal }, children),
  );
};
