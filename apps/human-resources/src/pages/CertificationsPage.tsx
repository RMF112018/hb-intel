import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function CertificationsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Certifications">
      <HbcEmptyState title="Certifications" description="Certification tracking and management tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
