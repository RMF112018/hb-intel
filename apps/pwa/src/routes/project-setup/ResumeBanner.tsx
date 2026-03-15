/**
 * W0-G5-T03: Draft resume prompt — shown when the user has an unsaved draft.
 * Follows SPFx pattern from apps/estimating/src/components/project-setup/ResumeBanner.tsx.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { IResumeContext, ISetupFormDraft } from '@hbc/features-estimating';
import { HbcBanner, HbcButton, HbcConfirmDialog } from '@hbc/ui-kit';

export interface ResumeBannerProps {
  resumeContext: IResumeContext<ISetupFormDraft>;
  onResume: () => void;
  onStartNew: () => void;
}

export function ResumeBanner({ resumeContext, onResume, onStartNew }: ResumeBannerProps): ReactNode {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (resumeContext.decision !== 'prompt-user') return null;

  const timestamp = resumeContext.draftTimestamp
    ? new Date(resumeContext.draftTimestamp).toLocaleString()
    : 'a previous session';

  return (
    <>
      <HbcBanner variant="info">
        You have an unsaved draft from {timestamp}.
        <HbcButton variant="primary" onClick={onResume}>
          Resume Draft
        </HbcButton>
        <HbcButton variant="secondary" onClick={() => setConfirmOpen(true)}>
          Start New
        </HbcButton>
      </HbcBanner>

      <HbcConfirmDialog
        open={confirmOpen}
        title="Discard Draft?"
        description="This will discard your saved progress."
        confirmLabel="Start New"
        variant="warning"
        onConfirm={() => {
          setConfirmOpen(false);
          onStartNew();
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
