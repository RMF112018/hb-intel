import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function HumanResourcesPage(): ReactNode {
  return (
    <WorkspacePageShell title="Human Resources" description="Staffing and certifications management">
      <HbcEmptyState
        title="Human Resources"
        description="Staffing and certification management tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
