/**
 * AppShellLayout — Toast-aware shell root wrapper
 * PH4B.9-UI-Design-Plan.md §12 (4b.9.1) | D-08
 *
 * Wraps ShellLayout with HbcToastProvider + HbcToastContainer so that
 * every page rendered within the shell can call useToast() without
 * additional setup. The toast container is mounted exactly once here
 * and portals to document.body.
 *
 * This component lives in @hbc/app-shell (not @hbc/shell) because
 * it bridges the @hbc/shell and @hbc/ui-kit packages. ShellLayout
 * provides the structural shell; AppShellLayout adds the feedback layer.
 *
 * Usage (PWA root):
 * ```tsx
 * import { AppShellLayout } from '@hbc/app-shell';
 *
 * function App() {
 *   return (
 *     <AppShellLayout>
 *       <RouterOutlet />
 *     </AppShellLayout>
 *   );
 * }
 * ```
 */
import type { ReactNode } from 'react';
import { ShellLayout } from '@hbc/shell';
import type { ShellLayoutProps } from '@hbc/shell';
import { HbcToastProvider, HbcToastContainer } from '@hbc/ui-kit';

export interface AppShellLayoutProps extends ShellLayoutProps {
  /** Maximum simultaneous visible toasts (default 3) */
  maxToasts?: number;
}

/**
 * Root shell layout with integrated toast notification system.
 * D-08: All transient feedback flows through useToast().
 * Pages must never mount their own HbcToastContainer.
 */
export function AppShellLayout({
  maxToasts = 3,
  children,
  ...shellProps
}: AppShellLayoutProps): ReactNode {
  return (
    <HbcToastProvider maxVisible={maxToasts}>
      <ShellLayout {...shellProps}>
        {children}
      </ShellLayout>
      {/* 4b.9.1: Single toast container, portaled to document.body */}
      <HbcToastContainer />
    </HbcToastProvider>
  );
}
