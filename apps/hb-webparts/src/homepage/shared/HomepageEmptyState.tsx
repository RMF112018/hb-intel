import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';

export interface HomepageEmptyStateProps {
  title: string;
  description: string;
}

export function HomepageEmptyState({ title, description }: HomepageEmptyStateProps): React.JSX.Element {
  return (
    <div data-hbc-homepage="empty-state">
      <HbcEmptyState title={title} description={description} />
    </div>
  );
}
