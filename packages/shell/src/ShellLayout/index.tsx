import type { ReactNode } from 'react';
import type { IActiveProject } from '@hbc/models';
import type { WorkspaceId } from '../types.js';
import { useNavStore } from '../stores/navStore.js';
import { HeaderBar } from '../HeaderBar/index.js';
import type { HeaderBarProps } from '../HeaderBar/index.js';
import { AppLauncher } from '../AppLauncher/index.js';
import { ProjectPicker } from '../ProjectPicker/index.js';
import { BackToProjectHub } from '../BackToProjectHub/index.js';
import { ContextualSidebar } from '../ContextualSidebar/index.js';

export interface ShellLayoutProps {
  /** 'full' = PWA (default), 'simplified' = SPFx / HB Site Control. */
  mode?: 'full' | 'simplified';
  children: ReactNode;
  /** Override slot for header tool-picker. */
  toolPickerSlot?: HeaderBarProps['toolPickerSlot'];
  /** Override slot for header right section. */
  rightSlot?: ReactNode;
  /** Override slot for sidebar content. */
  sidebarSlot?: ReactNode;
  /** Called when the user selects a project (ProjectPicker). */
  onProjectSelect?: (project: IActiveProject) => void;
  /** Called when "Back to Project Hub" is clicked. */
  onBackToProjectHub?: () => void;
  /** Called when a workspace tile is selected (AppLauncher). */
  onWorkspaceSelect?: (id: WorkspaceId) => void;
  /** Called when a sidebar item is clicked. */
  onSidebarNavigate?: (id: string) => void;
  /** Called when a tool-picker item is clicked. */
  onToolSelect?: (id: string) => void;
}

/**
 * Root shell orchestrator — Blueprint §1f, §2c.
 * Composes HeaderBar + ContextualSidebar + main content area.
 * mode='simplified' unmounts ProjectPicker + AppLauncher entirely (no dead code in SPFx bundle).
 */
export function ShellLayout({
  mode = 'full',
  children,
  toolPickerSlot,
  rightSlot,
  sidebarSlot,
  onProjectSelect,
  onBackToProjectHub,
  onWorkspaceSelect,
  onSidebarNavigate,
  onToolSelect,
}: ShellLayoutProps): ReactNode {
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const sidebarItems = useNavStore((s) => s.sidebarItems);

  const isProjectHub = activeWorkspace === 'project-hub';
  const showSidebar = sidebarItems.length > 0 || sidebarSlot != null;

  const leftSlot =
    mode === 'full'
      ? isProjectHub
        ? <ProjectPicker onProjectSelect={onProjectSelect} />
        : <BackToProjectHub onNavigate={onBackToProjectHub} />
      : undefined;

  const headerRightSlot =
    rightSlot ?? (mode === 'full' ? <AppLauncher onWorkspaceSelect={onWorkspaceSelect} /> : undefined);

  return (
    <div data-hbc-shell="shell-layout" data-mode={mode}>
      <HeaderBar
        leftSlot={leftSlot}
        toolPickerSlot={toolPickerSlot}
        rightSlot={headerRightSlot}
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
