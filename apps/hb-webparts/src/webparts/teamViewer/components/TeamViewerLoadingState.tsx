/**
 * TeamViewerLoadingState — spinner while article binding + list reads resolve.
 */
import * as React from 'react';
import { HbcSpinner } from '@hbc/ui-kit/homepage';

export function TeamViewerLoadingState(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading team"
      data-hbc-testid="team-viewer-loading"
      style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
    >
      <HbcSpinner size="md" />
    </div>
  );
}
