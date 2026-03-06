import type { ReactNode } from 'react';
import { AdminAccessControlPage } from '@hbc/auth';
import type { AccessControlAdminSection } from '@hbc/auth';
import { WorkspacePageShell } from '@hbc/ui-kit';

interface SystemSettingsPageProps {
  initialSection?: AccessControlAdminSection;
}

export function SystemSettingsPage({ initialSection = 'user-lookup' }: SystemSettingsPageProps): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Administration">
      <AdminAccessControlPage
        title="Access Control Administration"
        initialSection={initialSection}
      />
    </WorkspacePageShell>
  );
}
