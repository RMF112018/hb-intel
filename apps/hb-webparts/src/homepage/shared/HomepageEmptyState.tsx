import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';
import { hpEmptyStateContainer } from '../tokens.js';

export interface HomepageEmptyStateProps {
  title: string;
  description: string;
}

export function HomepageEmptyState({ title, description }: HomepageEmptyStateProps): React.JSX.Element {
  return (
    <div data-hbc-homepage="empty-state" role="status" aria-live="polite" style={hpEmptyStateContainer}>
      <HbcEmptyState title={title} description={description} />
    </div>
  );
}
