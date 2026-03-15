import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HbcBanner, HbcButton } from '@hbc/ui-kit';

export interface ClarificationBannerProps {
  requestId: string;
  clarificationNote?: string;
}

/**
 * Prompts the requester to return to the setup wizard in clarification-return mode.
 * W0-G4-T01: Shown on the detail page when request state is NeedsClarification.
 */
export function ClarificationBanner({ requestId, clarificationNote }: ClarificationBannerProps): ReactNode {
  const navigate = useNavigate();

  return (
    <HbcBanner variant="warning">
      {clarificationNote ?? 'The reviewer has requested additional information.'}
      <HbcButton
        variant="primary"
        onClick={() =>
          navigate({
            to: '/project-setup/new',
            search: { mode: 'clarification-return' as const, requestId },
          })
        }
      >
        Return to Setup Form
      </HbcButton>
    </HbcBanner>
  );
}
