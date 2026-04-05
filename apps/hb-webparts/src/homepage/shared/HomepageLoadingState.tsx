import * as React from 'react';
import { HbcSpinner } from '@hbc/ui-kit/homepage';
import { hpLoadingStateContainer } from '../tokens.js';

export interface HomepageLoadingStateProps {
  label: string;
}

export function HomepageLoadingState({ label }: HomepageLoadingStateProps): React.JSX.Element {
  return (
    <div aria-live="polite" data-hbc-homepage="loading-state" role="status" style={hpLoadingStateContainer}>
      <HbcSpinner label={label} size="md" />
    </div>
  );
}
