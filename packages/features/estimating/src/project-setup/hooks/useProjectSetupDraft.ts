/**
 * W0-G3-T05: Feature-local draft hook for project setup wizard surfaces.
 *
 * Resolves the correct draft key, TTL, and resume context based on the
 * wizard mode. Wraps `useAutoSaveDraft` from `@hbc/session-state`.
 *
 * @see docs/reference/workflow-experience/draft-key-registry.md
 */
import { useMemo } from 'react';
import { useAutoSaveDraft } from '@hbc/session-state';
import type { IAutoSaveDraftResult } from '@hbc/session-state';
import type {
  ProjectSetupWizardMode,
  ISetupFormDraft,
  IClarificationDraft,
  IControllerReviewDraft,
  IResumeContext,
} from '../types/index.js';
import {
  PROJECT_SETUP_DRAFT_KEY,
  buildClarificationDraftKey,
  buildControllerReviewDraftKey,
  NEW_REQUEST_DRAFT_TTL_HOURS,
  CLARIFICATION_DRAFT_TTL_HOURS,
  CONTROLLER_REVIEW_DRAFT_TTL_HOURS,
} from '../types/index.js';
import { buildResumeContext } from '../config/resumeDecision.js';

type DraftUnion = ISetupFormDraft | IClarificationDraft | IControllerReviewDraft;

function resolveDraftKey(mode: ProjectSetupWizardMode, requestId?: string): string {
  switch (mode) {
    case 'new-request':
      return PROJECT_SETUP_DRAFT_KEY;
    case 'clarification-return':
      if (!requestId) {
        throw new Error('requestId is required for clarification-return mode');
      }
      return buildClarificationDraftKey(requestId);
    case 'controller-review':
      if (!requestId) {
        throw new Error('requestId is required for controller-review mode');
      }
      return buildControllerReviewDraftKey(requestId);
  }
}

function resolveTtl(mode: ProjectSetupWizardMode): number {
  switch (mode) {
    case 'new-request':
      return NEW_REQUEST_DRAFT_TTL_HOURS;
    case 'clarification-return':
      return CLARIFICATION_DRAFT_TTL_HOURS;
    case 'controller-review':
      return CONTROLLER_REVIEW_DRAFT_TTL_HOURS;
  }
}

export interface IUseProjectSetupDraftResult {
  draft: DraftUnion | null;
  saveDraft: (value: DraftUnion) => void;
  clearDraft: () => void;
  resumeContext: IResumeContext<DraftUnion>;
  lastSavedAt: string | null;
  isSavePending: boolean;
}

export function useProjectSetupDraft(
  mode: ProjectSetupWizardMode,
  requestId?: string,
): IUseProjectSetupDraftResult {
  const draftKey = resolveDraftKey(mode, requestId);
  const ttl = resolveTtl(mode);

  const autoSave: IAutoSaveDraftResult<DraftUnion> = useAutoSaveDraft<DraftUnion>(
    draftKey,
    ttl,
  );

  const resumeContext = useMemo(
    () => buildResumeContext<DraftUnion>(mode, autoSave.value as (DraftUnion & { lastSavedAt: string }) | null),
    [mode, autoSave.value],
  );

  return {
    draft: autoSave.value,
    saveDraft: autoSave.queueSave,
    clearDraft: autoSave.clear,
    resumeContext,
    lastSavedAt: autoSave.lastSavedAt,
    isSavePending: autoSave.isSavePending,
  };
}
