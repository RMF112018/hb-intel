/**
 * P3-J1 E3 document-entry business rules.
 * Entry layer behavior, composition enforcement, state management.
 */

import type { DocumentCtaPath, DocumentEntryState, DocumentEmptyStateReason, DocumentNoAccessReason } from './enums.js';
import type { IDocumentCtaDefinition, IDocumentEmptyStateDef, IDocumentNoAccessDef } from './types.js';
import { DOCUMENT_CTA_DEFINITIONS, DOCUMENT_EMPTY_STATE_DEFINITIONS, DOCUMENT_NO_ACCESS_DEFINITIONS } from './constants.js';

// -- Governance invariants ----------------------------------------------------

export const isEntryLayerNotDivergentFeature = (): true => true;

export const matchesSharedShellDirection = (): true => true;

export const isFeatureLocalPrimitiveDuplicationAllowed = (): false => false;

export const isUiKitCompositionRequired = (): true => true;

// -- Lookup helpers -----------------------------------------------------------

export const getCtaDefinitionForPath = (path: DocumentCtaPath): IDocumentCtaDefinition | null =>
  DOCUMENT_CTA_DEFINITIONS.find((d) => d.ctaPath === path) ?? null;

export const getEmptyStateForReason = (reason: DocumentEmptyStateReason): IDocumentEmptyStateDef | null =>
  DOCUMENT_EMPTY_STATE_DEFINITIONS.find((d) => d.reason === reason) ?? null;

export const getNoAccessStateForReason = (reason: DocumentNoAccessReason): IDocumentNoAccessDef | null =>
  DOCUMENT_NO_ACCESS_DEFINITIONS.find((d) => d.reason === reason) ?? null;

// -- State visibility ---------------------------------------------------------

export const shouldShowCtaPaths = (state: DocumentEntryState): boolean =>
  state === 'READY';

export const shouldShowZoneNav = (state: DocumentEntryState): boolean =>
  state === 'READY';

// -- Preview support ----------------------------------------------------------

export const isPreviewSupported = (): true => true;
