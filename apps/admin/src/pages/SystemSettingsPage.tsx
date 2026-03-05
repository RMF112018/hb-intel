import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function SystemSettingsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="form" title="System Settings">
      <HbcEmptyState title="System Settings" description="System configuration tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
