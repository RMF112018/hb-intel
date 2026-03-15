import type { ReactNode } from 'react';
import type { ProjectSetupRequestState } from '@hbc/models';
import { HbcCard, HbcTypography } from '@hbc/ui-kit';
import { getStateContextText } from './stateDisplayHelpers.js';

export interface RequestStateContextProps {
  state: ProjectSetupRequestState;
}

/**
 * Contextual explanation of the current request state for the requester.
 * W0-G4-T01: Provides user-friendly guidance text per workflow state.
 */
export function RequestStateContext({ state }: RequestStateContextProps): ReactNode {
  return (
    <HbcCard>
      <HbcTypography intent="body">{getStateContextText(state)}</HbcTypography>
    </HbcCard>
  );
}
