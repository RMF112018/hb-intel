/**
 * ErrorFallback — route error boundary fallback.
 */
import type { ReactNode } from 'react';
// eslint-disable-next-line @hbc/hbc/no-direct-fluent-import -- TODO: migrate to @hbc/ui-kit (Phase 4b.11)
import { Button, Text } from '@fluentui/react-components';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): ReactNode {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 300,
      gap: 16,
    }}>
      <Text size={600} weight="bold">Something went wrong</Text>
      <Text size={300} style={{ color: 'var(--colorNeutralForeground3)', maxWidth: 500, textAlign: 'center' }}>
        {error.message}
      </Text>
      {resetErrorBoundary && (
        <Button appearance="primary" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      )}
    </div>
  );
}
