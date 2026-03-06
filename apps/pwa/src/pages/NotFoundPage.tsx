/**
 * NotFoundPage — 404 catch-all.
 */
import type { ReactNode } from 'react';
import { Button, Text, WorkspacePageShell } from '@hbc/ui-kit';
import { useRouter } from '@tanstack/react-router';

export function NotFoundPage(): ReactNode {
  const router = useRouter();

  return (
    <WorkspacePageShell layout="landing" title="Not Found">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        gap: 16,
      }}>
        <Text size={900} weight="bold">404</Text>
        <Text size={500}>Page not found</Text>
        <Text size={300} style={{ color: 'var(--colorNeutralForeground3)' }}>
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button
          appearance="primary"
          onClick={() => void router.navigate({ to: '/project-hub' })}
        >
          Back to Project Hub
        </Button>
      </div>
    </WorkspacePageShell>
  );
}
