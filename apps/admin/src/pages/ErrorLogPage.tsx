import type { ReactNode } from 'react';
import { HbcEmptyState, HbcCoachingCallout, WorkspacePageShell } from '@hbc/ui-kit';

/**
 * Error Log page — intentionally deferred to SF17-T05.
 *
 * Renders a clear empty state so the route never appears blank.
 *
 * @design G6-T01
 */
export function ErrorLogPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Error Log">
      <HbcEmptyState
        title="Error Log"
        description="Detailed error logging and audit trail will be available in a future release (SF17-T05)."
      />
      <HbcCoachingCallout
        message="This page is intentionally deferred. All admin alerts and monitors are fully functional in the Provisioning Oversight dashboard."
      />
    </WorkspacePageShell>
  );
}
