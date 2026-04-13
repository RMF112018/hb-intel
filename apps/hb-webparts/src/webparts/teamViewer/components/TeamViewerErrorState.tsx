/**
 * TeamViewerErrorState — renderer for data-load failures.
 */
import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';

export interface TeamViewerErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function TeamViewerErrorState({ error, onRetry }: TeamViewerErrorStateProps): React.JSX.Element {
  return (
    <section
      role="alert"
      data-hbc-testid="team-viewer-error"
      aria-label="Team viewer error"
    >
      <HbcEmptyState
        title="Team members unavailable"
        description={error.message || 'Unable to load team members. Please refresh or try again later.'}
        action={
          onRetry ? (
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          ) : undefined
        }
      />
    </section>
  );
}
