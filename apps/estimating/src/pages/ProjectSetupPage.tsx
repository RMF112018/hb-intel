import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ProjectSetupPage(): ReactNode {
  return (
    <WorkspacePageShell title="Project Setup" description="Project estimation setup and configuration">
      <HbcEmptyState title="Project Setup" description="Project estimation setup tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
