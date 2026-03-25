/**
 * P3-J1 E5 document-vocabulary business rules.
 * SharePoint exposure checks, plain language enforcement, trust model consistency,
 * phase 5 carry-forward, trust state resolution, badge variant mapping, UI pattern
 * config, terminology guardrail violation detection, user-facing descriptions, and
 * preview action visibility.
 */

import type { DocumentBadgeVariant, DocumentTrustState, UiKitDocumentPattern } from './enums.js';
import type { IDocumentTrustStateDef, ITerminologyGuardrailDef, IUiStateMatrixEntry } from './types.js';
import {
  DOCUMENT_STATE_UI_BINDINGS,
  DOCUMENT_TRUST_STATE_DEFINITIONS,
  TERMINOLOGY_GUARDRAILS,
  UI_STATE_MATRIX,
} from './constants.js';

export const isSharePointInternalExposed = (): false => false;

export const isPlainLanguageRequired = (): true => true;

export const usesConsistentTrustModel = (): true => true;

export const canPhase5CarryForwardUnchanged = (): true => true;

export const resolveDocumentTrustState = (
  authorityState: string,
  availabilityState: string,
): DocumentTrustState | null => {
  const binding = DOCUMENT_STATE_UI_BINDINGS.find(
    (b) => b.authorityState === authorityState && b.availabilityState === availabilityState,
  );
  return binding?.resolvedTrustState ?? null;
};

export const getBadgeVariantForTrustState = (trustState: DocumentTrustState): DocumentBadgeVariant | null => {
  const def = DOCUMENT_TRUST_STATE_DEFINITIONS.find((d) => d.trustState === trustState);
  return def?.badgeVariant ?? null;
};

export const getUiPatternConfig = (
  trustState: DocumentTrustState,
  uiPattern: UiKitDocumentPattern,
): IUiStateMatrixEntry | null =>
  UI_STATE_MATRIX.find((e) => e.trustState === trustState && e.uiPattern === uiPattern) ?? null;

export const isTerminologyGuardrailViolation = (text: string): boolean => {
  const lower = text.toLowerCase();
  return TERMINOLOGY_GUARDRAILS.some((g: ITerminologyGuardrailDef) =>
    g.violationTerms.some((term) => lower.includes(term)),
  );
};

export const getUserFacingDescription = (trustState: DocumentTrustState): string | null => {
  const def: IDocumentTrustStateDef | undefined = DOCUMENT_TRUST_STATE_DEFINITIONS.find(
    (d) => d.trustState === trustState,
  );
  return def?.description ?? null;
};

export const shouldShowPreviewAction = (
  trustState: DocumentTrustState,
  uiPattern: UiKitDocumentPattern,
): boolean => {
  const entry = UI_STATE_MATRIX.find(
    (e) => e.trustState === trustState && e.uiPattern === uiPattern,
  );
  return entry?.showPreviewAction ?? false;
};
