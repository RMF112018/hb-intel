/**
 * HbcToast — Phase 4b.9 Notifications & Feedback System
 * PH4B.9-UI-Design-Plan.md §12 (4b.9.2)
 *
 * V3.0: Four toast categories (success | error | warning | info) per D-08.
 * Supersedes V2.1 three-category restriction (ADR-0022 amended by ADR-0043).
 *
 * Category behavior:
 * - success: auto-dismisses after 3 000 ms
 * - error: requires manual dismissal (close button)
 * - warning: auto-dismisses after 5 000 ms (longer visibility for caution)
 * - info: auto-dismisses after 4 000 ms
 */
import type * as React from 'react';

/**
 * V3.0 toast categories — four variants for transient feedback.
 * Persistent page-level warnings use HbcBanner via WorkspacePageShell.banner prop.
 */
export type ToastCategory = 'success' | 'error' | 'warning' | 'info';

/** Configuration for creating a toast notification */
export interface ToastConfig {
  /** Toast category controlling color, icon, and dismiss behavior */
  category: ToastCategory;
  /** Toast message content */
  message: React.ReactNode;
  /** Override default category icon */
  icon?: React.ReactNode;
}

/** Internal toast entry with unique identifier */
export interface ToastEntry extends ToastConfig {
  /** Unique toast identifier */
  id: string;
}

/**
 * Convenience API returned by useToast().
 * Each method triggers a toast of the corresponding category.
 *
 * @example
 * ```ts
 * const { toast } = useToast();
 * toast.success('Risk item saved.');
 * toast.error('Failed to save. Please try again.');
 * toast.warning('Record locked by another user.');
 * toast.info('Export started. Download will begin shortly.');
 * ```
 */
export interface ToastApi {
  /** Show a success toast (auto-dismisses after 3 s) */
  success: (message: React.ReactNode, icon?: React.ReactNode) => string;
  /** Show an error toast (manual dismiss via close button) */
  error: (message: React.ReactNode, icon?: React.ReactNode) => string;
  /** Show a warning toast (auto-dismisses after 5 s) */
  warning: (message: React.ReactNode, icon?: React.ReactNode) => string;
  /** Show an info toast (auto-dismisses after 4 s) */
  info: (message: React.ReactNode, icon?: React.ReactNode) => string;
}

/** Context value exposed by HbcToastProvider */
export interface ToastContextValue {
  /** Low-level API: add a toast with explicit config */
  addToast: (config: ToastConfig) => string;
  /** Dismiss a single toast by id */
  dismissToast: (id: string) => void;
  /** Dismiss all toasts of a given category */
  dismissCategory: (category: ToastCategory) => void;
  /** Convenience API with per-category methods */
  toast: ToastApi;
}

export interface HbcToastProviderProps {
  children: React.ReactNode;
  /** Maximum visible toasts (default 3) */
  maxVisible?: number;
}
