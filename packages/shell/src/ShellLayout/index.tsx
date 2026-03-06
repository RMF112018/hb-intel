import type { ReactNode } from 'react';
import { HeaderBar } from '../HeaderBar/index.js';
import type { HeaderBarProps } from '../HeaderBar/index.js';
import { ContextualSidebar } from '../ContextualSidebar/index.js';

export interface ShellLayoutProps {
  /** 'full' = PWA (default), 'simplified' = SPFx / HB Site Control. */
  mode?: 'full' | 'simplified';
  children: ReactNode;
  /** Left section slot (ShellCore-owned composition in Phase 5.5). */
  leftSlot?: ReactNode;
  /** Override slot for header tool-picker. */
  toolPickerSlot?: HeaderBarProps['toolPickerSlot'];
  /** Override slot for header right section. */
  rightSlot?: ReactNode;
  /** Override slot for sidebar content. */
  sidebarSlot?: ReactNode;
  /** Explicit sidebar visibility override from ShellCore rules. */
  showSidebar?: boolean;
  /** Called when a sidebar item is clicked. */
  onSidebarNavigate?: (id: string) => void;
  /** Called when a tool-picker item is clicked. */
  onToolSelect?: (id: string) => void;
}

/**
 * Shell layout surface — Blueprint §1f, §2c.
 *
 * Phase 5.5 narrow-boundary rule:
 * - This component remains presentational only.
 * - ShellCore owns orchestration (routing, auth, adapter extensions, cleanup).
 */
export function ShellLayout({
  mode = 'full',
  children,
  leftSlot,
  toolPickerSlot,
  rightSlot,
  sidebarSlot,
  showSidebar = mode === 'full',
  onSidebarNavigate,
  onToolSelect,
}: ShellLayoutProps): ReactNode {
  return (
    <div data-hbc-shell="shell-layout" data-mode={mode}>
      <HeaderBar
        leftSlot={leftSlot}
        toolPickerSlot={toolPickerSlot}
        rightSlot={rightSlot}
        onToolSelect={onToolSelect}
      />
      <div data-hbc-shell="shell-body">
        {showSidebar && (
          <ContextualSidebar sidebarSlot={sidebarSlot} onNavigate={onSidebarNavigate} />
        )}
        <main data-hbc-shell="shell-content">
          {children}
        </main>
      </div>
    </div>
  );
}
