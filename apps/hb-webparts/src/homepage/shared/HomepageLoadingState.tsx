import * as React from 'react';
import { HbcSpinner } from '@hbc/ui-kit/homepage';

export interface HomepageLoadingStateProps {
  label: string;
}

export function HomepageLoadingState({ label }: HomepageLoadingStateProps): React.JSX.Element {
  return (
    <div aria-live="polite" data-hbc-homepage="loading-state" role="status">
      <HbcSpinner label={label} size="md" />
    </div>
  );
}
