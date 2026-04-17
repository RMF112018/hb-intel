import * as React from 'react';
import styles from './ShellFallbackSurface.module.css';

export type FallbackReason =
  | 'render-failure'
  | 'invalid-assignment'
  | 'inactive-candidate'
  | 'unknown-occupant';

interface ShellFallbackSurfaceProps {
  zoneName: string;
  reason: FallbackReason;
  message?: string;
}

const DEFAULT_MESSAGES: Record<FallbackReason, string> = {
  'render-failure': 'This section is temporarily unavailable.',
  'invalid-assignment': 'This section could not be configured correctly.',
  'inactive-candidate': '',
  'unknown-occupant': 'This section is not recognized.',
};

export function ShellFallbackSurface({
  zoneName,
  reason,
  message,
}: ShellFallbackSurfaceProps): React.JSX.Element | null {
  if (reason === 'inactive-candidate') return null;

  const displayMessage = message || DEFAULT_MESSAGES[reason];

  return (
    <div
      className={styles.fallback}
      data-shell-fallback={zoneName}
      data-shell-fallback-reason={reason}
      role="status"
      aria-label={`${formatZoneName(zoneName)}: ${displayMessage}`}
    >
      <p className={styles.fallbackMessage}>{displayMessage}</p>
    </div>
  );
}

function formatZoneName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
