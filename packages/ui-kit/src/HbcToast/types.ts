/**
 * HbcToast — Phase 4.9 Messaging & Feedback System
 * V2.1 Three-category restriction: success | error | sync-status
 */
import type * as React from 'react';

/** V2.1: Only three toast categories allowed */
export type ToastCategory = 'success' | 'error' | 'sync-status';

export interface ToastConfig {
  /** V2.1 toast category */
  category: ToastCategory;
  /** Toast message content */
  message: React.ReactNode;
  /** Override default category icon */
  icon?: React.ReactNode;
}

export interface ToastEntry extends ToastConfig {
  /** Unique toast identifier */
  id: string;
}

export interface ToastContextValue {
  /** Add a toast to the stack */
  addToast: (config: ToastConfig) => string;
  /** Dismiss a single toast by id */
  dismissToast: (id: string) => void;
  /** Dismiss all toasts of a given category */
  dismissCategory: (category: ToastCategory) => void;
}

export interface HbcToastProviderProps {
  children: React.ReactNode;
  /** Maximum visible toasts (default 3) */
  maxVisible?: number;
}
