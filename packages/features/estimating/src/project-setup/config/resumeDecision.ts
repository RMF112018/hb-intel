/**
 * W0-G3-T05: Pure resume decision helpers for draft/resume contract.
 *
 * Determines whether a wizard session should prompt the user to resume,
 * auto-continue from a saved draft, or start fresh.
 *
 * @see docs/reference/workflow-experience/draft-key-registry.md
 */
import type { ProjectSetupWizardMode, ResumeDecision, IResumeContext } from '../types/index.js';

/**
 * Resolves the resume decision for a given mode and draft existence.
 *
 * - `new-request` with existing draft → `prompt-user` (ask whether to resume)
 * - `new-request` without draft → `fresh-start`
 * - `clarification-return` / `controller-review` → always `auto-continue`
 */
export function resolveResumeDecision(
  mode: ProjectSetupWizardMode,
  draftExists: boolean,
): ResumeDecision {
  if (mode === 'new-request') {
    return draftExists ? 'prompt-user' : 'fresh-start';
  }
  return 'auto-continue';
}

/**
 * Builds a complete resume context from mode and draft state.
 */
export function buildResumeContext<T extends { lastSavedAt: string }>(
  mode: ProjectSetupWizardMode,
  draft: T | null,
): IResumeContext<T> {
  return {
    mode,
    existingDraft: draft,
    decision: resolveResumeDecision(mode, draft !== null),
    draftTimestamp: draft?.lastSavedAt ?? null,
  };
}
