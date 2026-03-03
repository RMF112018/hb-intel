/**
 * WorkspacePageShell — shared page wrapper for all workspace pages.
 * Displays workspace title, project context, and optional status badges.
 */
import type { ReactNode } from 'react';
import { Text } from '@fluentui/react-components';
import { useProjectStore } from '@hbc/shell';
import { HbcStatusBadge } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';

interface WorkspacePageShellProps {
  title: string;
  description?: string;
  status?: { label: string; variant: StatusVariant };
  children: ReactNode;
}

export function WorkspacePageShell({
  title,
  description,
  status,
  children,
}: WorkspacePageShellProps): ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text as="h1" size={700} weight="bold">{title}</Text>
          {description && (
            <Text as="p" size={300} style={{ color: 'var(--colorNeutralForeground3)', marginTop: 4 }}>
              {description}
            </Text>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status && <HbcStatusBadge label={status.label} variant={status.variant} />}
          {activeProject && (
            <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>
              {activeProject.name} ({activeProject.number})
            </Text>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
