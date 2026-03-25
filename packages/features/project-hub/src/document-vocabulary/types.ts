/**
 * P3-J1 E5 document-vocabulary TypeScript contracts.
 * Trust state definitions, UI state matrix entries, terminology guardrails,
 * copy rules, and document state UI bindings.
 */

import type {
  CopyToneRule,
  DocumentBadgeVariant,
  DocumentTrustState,
  TerminologyGuardrail,
  UiKitDocumentPattern,
} from './enums.js';

export interface IDocumentTrustStateDef {
  readonly trustState: DocumentTrustState;
  readonly badgeVariant: DocumentBadgeVariant;
  readonly label: string;
  readonly description: string;
  readonly isAuthoritative: boolean;
  readonly isRestricted: boolean;
}

export interface IUiStateMatrixEntry {
  readonly trustState: DocumentTrustState;
  readonly uiPattern: UiKitDocumentPattern;
  readonly badgeVariant: DocumentBadgeVariant;
  readonly showPreviewAction: boolean;
  readonly description: string;
}

export interface ITerminologyGuardrailDef {
  readonly guardrail: TerminologyGuardrail;
  readonly label: string;
  readonly description: string;
  readonly violationTerms: readonly string[];
}

export interface ICopyRule {
  readonly toneRule: CopyToneRule;
  readonly label: string;
  readonly description: string;
}

export interface IDocumentStateUiBinding {
  readonly authorityState: string;
  readonly availabilityState: string;
  readonly resolvedTrustState: DocumentTrustState;
  readonly description: string;
}
