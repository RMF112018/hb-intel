/**
 * TeamViewerEmptyState — premium empty state for TeamViewer.
 */
import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';

export interface TeamViewerEmptyStateProps {
  title?: string;
  description?: string;
}

export function TeamViewerEmptyState({
  title = 'No team members to show',
  description = 'This article has no team members linked yet. Once an editor links them, they will appear here.',
}: TeamViewerEmptyStateProps): React.JSX.Element {
  return (
    <section
      data-hbc-testid="team-viewer-empty"
      aria-label="Team viewer empty state"
    >
      <HbcEmptyState title={title} description={description} />
    </section>
  );
}
