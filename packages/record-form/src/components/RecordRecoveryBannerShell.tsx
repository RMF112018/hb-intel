/**
 * SF23-T06 — HbcRecordRecoveryBanner composition shell.
 *
 * Governing: SF23-T06, L-04
 */

import React, { useMemo } from 'react';
import { HbcRecordRecoveryBanner, type RecoveryBannerDraftInfo } from '@hbc/ui-kit';
import type { IRecordFormState } from '../types/index.js';

export interface RecordRecoveryBannerShellProps {
  state: IRecordFormState;
  onCompare?: () => void;
  onRestore?: () => void;
  onDiscard?: () => void;
  onRetry?: () => void;
  onResume?: () => void;
}

export function RecordRecoveryBannerShell({ state, onCompare, onRestore, onDiscard, onRetry, onResume }: RecordRecoveryBannerShellProps): React.ReactElement | null {
  const visible = state.explanation.isRecoveryActive;

  const draftInfo: RecoveryBannerDraftInfo = useMemo(() => ({
    source: state.sync.state === 'partially-recovered' ? 'stale-restored' as const
      : state.sync.state === 'saved-locally' ? 'local' as const
      : 'restored' as const,
    timestampIso: state.draft.lastSavedAtIso ?? state.draft.createdAtIso,
    conflictCount: 0,
  }), [state.sync.state, state.draft.lastSavedAtIso, state.draft.createdAtIso]);

  const syncStatus = state.sync.state === 'saved-locally' ? 'saved-locally' as const
    : state.sync.state === 'queued-to-sync' ? 'queued-to-sync' as const
    : null;

  const trustWarning = state.confidence.level === 'recovered-needs-review'
    ? 'This draft was recovered and needs review before continuing'
    : state.confidence.level === 'partially-resolved'
      ? 'Some fields may be missing or outdated'
      : null;

  return (
    <HbcRecordRecoveryBanner
      visible={visible}
      reasonMessage={state.explanation.summaryMessage}
      trustWarning={trustWarning}
      draftInfo={draftInfo}
      syncStatus={syncStatus}
      canCompare={!!onCompare}
      canRestore={!!onRestore}
      canDiscard={!!onDiscard}
      canRetry={!!onRetry}
      canResume={!!onResume && !state.explanation.isBlocked}
      onCompare={onCompare}
      onRestore={onRestore}
      onDiscard={onDiscard}
      onRetry={onRetry}
      onResume={onResume}
    />
  );
}
