/**
 * SF23-T05 — HbcRecordForm composition shell.
 *
 * Wires useRecordFormState to @hbc/ui-kit HbcRecordForm props.
 *
 * Governing: SF23-T05, L-01
 */

import React, { useMemo } from 'react';
import { HbcRecordForm, type RecordFormField, type RecordFormRecoveryBanner } from '@hbc/ui-kit';
import type { RecordFormComplexityTier } from '../types/index.js';
import type { IRecordFormStorageAdapter } from '../storage/IRecordFormStorageAdapter.js';
import { useRecordFormState } from '../hooks/useRecordFormState.js';

export interface RecordFormShellProps {
  adapter: IRecordFormStorageAdapter;
  moduleId: string;
  projectId: string;
  complexityTier: RecordFormComplexityTier;
  fields: RecordFormField[];
  onFieldChange: (key: string, value: string) => void;
  onSaveDraft?: () => void;
  onDiscardRecovery?: () => void;
  onAcceptRecovery?: () => void;
}

export function RecordFormShell({
  adapter,
  moduleId,
  projectId,
  complexityTier,
  fields,
  onFieldChange,
  onSaveDraft,
  onDiscardRecovery,
  onAcceptRecovery,
}: RecordFormShellProps): React.ReactElement {
  const { forms, isLoading, topRecommended } = useRecordFormState({ adapter, moduleId, projectId });

  const activeForm = forms[0] ?? null;

  const isBlocked = activeForm?.explanation.isBlocked ?? false;
  const blockMessage = isBlocked
    ? activeForm?.explanation.summaryMessage ?? 'Cannot submit'
    : null;
  const warnings = useMemo(
    () => activeForm?.explanation.warnings.map(w => w.message) ?? [],
    [activeForm],
  );

  const recoveryBanner: RecordFormRecoveryBanner | null = useMemo(() => {
    if (!activeForm?.explanation.isRecoveryActive) return null;
    return {
      message: 'Draft recovered — review before continuing',
      recoveredAtIso: new Date().toISOString(),
      hasConflicts: false,
      conflictCount: 0,
    };
  }, [activeForm]);

  const syncStatus = activeForm?.sync.state === 'saved-locally' ? 'Saved locally'
    : activeForm?.sync.state === 'queued-to-sync' ? 'Queued to sync'
    : null;

  return (
    <HbcRecordForm
      fields={fields}
      complexityTier={complexityTier}
      mode={activeForm?.draft.mode ?? 'create'}
      isBlocked={isBlocked}
      blockMessage={blockMessage}
      warnings={warnings}
      recoveryBanner={recoveryBanner}
      recommendedAction={topRecommended?.reason ?? null}
      isDirty={activeForm?.draft.isDirty ?? false}
      syncStatus={syncStatus}
      loading={isLoading}
      onFieldChange={onFieldChange}
      onSaveDraft={onSaveDraft}
      onDiscardRecovery={onDiscardRecovery}
      onAcceptRecovery={onAcceptRecovery}
    />
  );
}
