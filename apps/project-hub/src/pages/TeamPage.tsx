import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function TeamPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Team">
      <HbcEmptyState
        title="Team"
        description="Team management tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
