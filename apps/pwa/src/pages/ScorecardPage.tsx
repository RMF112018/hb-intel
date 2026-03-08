/**
 * ScorecardPage — D-PH6F-08: useFormDraft pattern reference implementation.
 * Minimal scorecard form demonstrating draft auto-save/restore.
 * Blueprint §4c (Multi-step form patterns).
 */
import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  WorkspacePageShell,
  HbcForm,
  HbcFormSection,
  HbcTextField,
  HbcSelect,
  HbcStickyFormFooter,
  HbcBanner,
  useHbcFormContext,
} from '@hbc/ui-kit';
import { useFormDraft } from '@hbc/query-hooks';

const SCORECARD_DEFAULTS = {
  projectName: '',
  overallScore: '',
  notes: '',
};

const SCORE_OPTIONS = [
  { value: '1', label: '1 - Poor' },
  { value: '2', label: '2 - Below Average' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
];

/** Inner component to access HbcFormContext for auto-save (must be inside HbcForm provider). */
function ScorecardDraftAutoSave({ saveDraft }: { saveDraft: (data: Record<string, unknown>) => void }) {
  const { getValues, formState } = useHbcFormContext();
  useEffect(() => {
    if (formState.isDirty) saveDraft(getValues());
  }, [formState.isDirty, formState.dirtyFields, getValues, saveDraft]);
  return null;
}

export function ScorecardPage(): ReactNode {
  const { hasDraft, saveDraft, restoreDraftValues, clearDraft, submitWithDraftClear } =
    useFormDraft('scorecard:new');

  const defaultValues = restoreDraftValues(SCORECARD_DEFAULTS);
  const [showDraftBanner, setShowDraftBanner] = useState(hasDraft);

  const handleValidSubmit = useCallback(
    submitWithDraftClear(async (values: Record<string, unknown>) => {
      console.info('[Scorecard] submitted:', values);
    }),
    [submitWithDraftClear],
  );

  const handleCancel = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return (
    <WorkspacePageShell layout="dashboard" title="Scorecard">
      {showDraftBanner && (
        <HbcBanner variant="info" onDismiss={() => setShowDraftBanner(false)}>
          Draft restored. Your unsaved changes have been recovered.
        </HbcBanner>
      )}
      <HbcForm
        defaultValues={defaultValues}
        onValidSubmit={handleValidSubmit}
        stickyFooter={
          <HbcStickyFormFooter
            onCancel={handleCancel}
            primaryLabel="Submit Scorecard"
          />
        }
      >
        <ScorecardDraftAutoSave saveDraft={saveDraft} />
        <HbcFormSection title="Project Scorecard">
          <HbcTextField
            name="projectName"
            label="Project Name"
            placeholder="Enter project name"
            required
          />
          <HbcSelect
            name="overallScore"
            label="Overall Score"
            options={SCORE_OPTIONS}
            placeholder="Select a score"
            required
          />
          <HbcTextField
            name="notes"
            label="Notes"
            placeholder="Additional comments..."
          />
        </HbcFormSection>
      </HbcForm>
    </WorkspacePageShell>
  );
}
