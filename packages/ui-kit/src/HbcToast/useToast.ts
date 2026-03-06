/**
 * HbcToastProvider + useToast hook — Phase 4b.9
 * Reference: PH4B.9-UI-Design-Plan.md §12 (4b.9.1, 4b.9.2)
 *
 * Imperative toast API via React context.
 * V3.0: Four categories with convenience API:
 *   toast.success(msg) — auto-dismiss 3 s
 *   toast.error(msg)   — manual dismiss (close button)
 *   toast.warning(msg) — auto-dismiss 5 s
 *   toast.info(msg)    — auto-dismiss 4 s
 *
 * D-08 enforcement: all transient feedback MUST use useToast().
 * Persistent warnings use WorkspacePageShell.banner prop with HbcBanner.
 */
import * as React from 'react';
import type {
  ToastConfig,
  ToastEntry,
  ToastContextValue,
  ToastCategory,
  ToastApi,
  HbcToastProviderProps,
} from './types.js';

let nextId = 0;
const genId = () => `hbc-toast-${++nextId}`;

/**
 * Auto-dismiss durations per category (ms).
 * error = 0 means no auto-dismiss — requires manual close.
 */
const AUTO_DISMISS_MS: Record<ToastCategory, number> = {
  success: 3000,
  error: 0,
  warning: 5000,
  info: 4000,
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * useToast — imperative toast API.
 * Must be called within an HbcToastProvider (mounted once in ShellLayout).
 *
 * @returns {{ toast, addToast, dismissToast, dismissCategory }}
 *
 * @example
 * ```ts
 * const { toast } = useToast();
 * toast.success('Changes saved.');
 * toast.error('Network error. Try again.');
 * ```
 */
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

/**
 * HbcToastProvider — context provider managing toast lifecycle.
 * Mount exactly once in the shell root (ShellLayout).
 * Never mount inside individual pages.
 */
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

      // Schedule auto-dismiss based on category timing
      const duration = AUTO_DISMISS_MS[config.category];
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  /**
   * Convenience API — wraps addToast with per-category shorthand.
   * Memoized to maintain stable references across renders.
   */
  const toast = React.useMemo<ToastApi>(
    () => ({
      success: (message, icon) => addToast({ category: 'success', message, icon }),
      error: (message, icon) => addToast({ category: 'error', message, icon }),
      warning: (message, icon) => addToast({ category: 'warning', message, icon }),
      info: (message, icon) => addToast({ category: 'info', message, icon }),
    }),
    [addToast],
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({ addToast, dismissToast, dismissCategory, toast }),
    [addToast, dismissToast, dismissCategory, toast],
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
