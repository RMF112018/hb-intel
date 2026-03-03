import type { ReactNode } from 'react';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcEmptyState } from '@hbc/ui-kit';

export function PmpPage(): ReactNode {
  return (
    <WorkspacePageShell title="PMP" description="Project management planning">
      <HbcEmptyState
        title="PMP"
        description="Project management planning tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
