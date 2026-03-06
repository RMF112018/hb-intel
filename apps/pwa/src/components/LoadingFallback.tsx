/**
 * LoadingFallback — route pending/suspense fallback with HB branding.
 */
import type { ReactNode } from 'react';
// eslint-disable-next-line @hbc/hbc/no-direct-fluent-import -- TODO: migrate to @hbc/ui-kit (Phase 4b.11)
import { Spinner, Text } from '@fluentui/react-components';

export function LoadingFallback(): ReactNode {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 300,
      gap: 12,
    }}>
      <Spinner size="large" />
      <Text size={300} style={{ color: 'var(--colorNeutralForeground3)' }}>
        Loading workspace...
      </Text>
    </div>
  );
}
