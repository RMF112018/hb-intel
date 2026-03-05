import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ProjectSetupPage(): ReactNode {
  return (
    <WorkspacePageShell layout="form" title="Project Setup">
      <HbcEmptyState title="Project Setup" description="Project estimation setup tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
