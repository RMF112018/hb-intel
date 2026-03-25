/**
 * P3-J1 E3 document-entry contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  DOCUMENT_CTA_PATHS,
  DOCUMENT_ENTRY_STATES,
  DOCUMENT_EMPTY_STATE_REASONS,
  DOCUMENT_NO_ACCESS_REASONS,
  DOCUMENT_COMPOSITION_SOURCES,
  // Label maps
  DOCUMENT_CTA_PATH_LABELS,
  DOCUMENT_ENTRY_STATE_LABELS,
  DOCUMENT_EMPTY_STATE_REASON_LABELS,
  // Contracts & constants
  DOCUMENT_CTA_DEFINITIONS,
  DOCUMENT_ENTRY_STATE_CONFIGS,
  DOCUMENT_EMPTY_STATE_DEFINITIONS,
  DOCUMENT_NO_ACCESS_DEFINITIONS,
  DOCUMENT_COMPOSITION_CONTRACTS,
  // Business rules
  isEntryLayerNotDivergentFeature,
  matchesSharedShellDirection,
  isFeatureLocalPrimitiveDuplicationAllowed,
  isUiKitCompositionRequired,
  getCtaDefinitionForPath,
  getEmptyStateForReason,
  getNoAccessStateForReason,
  shouldShowCtaPaths,
  shouldShowZoneNav,
  isPreviewSupported,
  // Types (compile-time checks)
  type IDocumentCtaDefinition,
  type IDocumentEntryStateConfig,
  type IDocumentEmptyStateDef,
  type IDocumentNoAccessDef,
} from '../index.js';

// -- Contract stability -------------------------------------------------------

describe('document-entry contract stability', () => {
  it('DOCUMENT_CTA_PATHS has 5 members', () => {
    expect(DOCUMENT_CTA_PATHS).toHaveLength(5);
  });

  it('DOCUMENT_ENTRY_STATES has 5 members', () => {
    expect(DOCUMENT_ENTRY_STATES).toHaveLength(5);
  });

  it('DOCUMENT_EMPTY_STATE_REASONS has 4 members', () => {
    expect(DOCUMENT_EMPTY_STATE_REASONS).toHaveLength(4);
  });

  it('DOCUMENT_NO_ACCESS_REASONS has 4 members', () => {
    expect(DOCUMENT_NO_ACCESS_REASONS).toHaveLength(4);
  });

  it('DOCUMENT_COMPOSITION_SOURCES has 3 members', () => {
    expect(DOCUMENT_COMPOSITION_SOURCES).toHaveLength(3);
  });

  it('DOCUMENT_CTA_PATH_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_CTA_PATH_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_ENTRY_STATE_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_ENTRY_STATE_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_EMPTY_STATE_REASON_LABELS has 4 keys', () => {
    expect(Object.keys(DOCUMENT_EMPTY_STATE_REASON_LABELS)).toHaveLength(4);
  });

  it('DOCUMENT_CTA_DEFINITIONS has 5 entries', () => {
    expect(DOCUMENT_CTA_DEFINITIONS).toHaveLength(5);
  });

  it('DOCUMENT_ENTRY_STATE_CONFIGS has 5 entries', () => {
    expect(DOCUMENT_ENTRY_STATE_CONFIGS).toHaveLength(5);
  });

  it('READY state shows CTAs and zone nav', () => {
    const ready = DOCUMENT_ENTRY_STATE_CONFIGS.find((c) => c.state === 'READY');
    expect(ready).toBeDefined();
    expect(ready!.showCtaPaths).toBe(true);
    expect(ready!.showZoneNav).toBe(true);
  });

  it('non-READY states do not show CTAs or zone nav', () => {
    const nonReady = DOCUMENT_ENTRY_STATE_CONFIGS.filter((c) => c.state !== 'READY');
    for (const config of nonReady) {
      expect(config.showCtaPaths).toBe(false);
      expect(config.showZoneNav).toBe(false);
    }
  });

  it('DOCUMENT_EMPTY_STATE_DEFINITIONS has 4 entries', () => {
    expect(DOCUMENT_EMPTY_STATE_DEFINITIONS).toHaveLength(4);
  });

  it('DOCUMENT_NO_ACCESS_DEFINITIONS has 4 entries', () => {
    expect(DOCUMENT_NO_ACCESS_DEFINITIONS).toHaveLength(4);
  });

  it('DOCUMENT_COMPOSITION_CONTRACTS has 3 entries', () => {
    expect(DOCUMENT_COMPOSITION_CONTRACTS).toHaveLength(3);
  });

  it('all composition contracts have noFeatureLocalDuplication true and uiKitRequired true', () => {
    for (const contract of DOCUMENT_COMPOSITION_CONTRACTS) {
      expect(contract.noFeatureLocalDuplication).toBe(true);
      expect(contract.uiKitRequired).toBe(true);
    }
  });

  it('type-checks IDocumentCtaDefinition', () => {
    const def: IDocumentCtaDefinition = DOCUMENT_CTA_DEFINITIONS[0];
    expect(def.ctaPath).toBeDefined();
    expect(def.displayLabel).toBeDefined();
  });

  it('type-checks IDocumentEntryStateConfig', () => {
    const config: IDocumentEntryStateConfig = DOCUMENT_ENTRY_STATE_CONFIGS[0];
    expect(config.state).toBeDefined();
    expect(config.displayMessage).toBeDefined();
  });

  it('type-checks IDocumentEmptyStateDef', () => {
    const def: IDocumentEmptyStateDef = DOCUMENT_EMPTY_STATE_DEFINITIONS[0];
    expect(def.reason).toBeDefined();
    expect(def.title).toBeDefined();
  });

  it('type-checks IDocumentNoAccessDef', () => {
    const def: IDocumentNoAccessDef = DOCUMENT_NO_ACCESS_DEFINITIONS[0];
    expect(def.reason).toBeDefined();
    expect(def.title).toBeDefined();
  });
});

// -- Business rules -----------------------------------------------------------

describe('document-entry business rules', () => {
  it('isEntryLayerNotDivergentFeature returns true', () => {
    expect(isEntryLayerNotDivergentFeature()).toBe(true);
  });

  it('matchesSharedShellDirection returns true', () => {
    expect(matchesSharedShellDirection()).toBe(true);
  });

  it('isFeatureLocalPrimitiveDuplicationAllowed returns false', () => {
    expect(isFeatureLocalPrimitiveDuplicationAllowed()).toBe(false);
  });

  it('isUiKitCompositionRequired returns true', () => {
    expect(isUiKitCompositionRequired()).toBe(true);
  });

  // getCtaDefinitionForPath
  it('getCtaDefinitionForPath returns definition for OPEN_PROJECT_DOCUMENTS', () => {
    const result = getCtaDefinitionForPath('OPEN_PROJECT_DOCUMENTS');
    expect(result).not.toBeNull();
    expect(result!.routeType).toBe('PROJECT_SCOPED_LANDING');
  });

  it('getCtaDefinitionForPath VIEW_BY_ZONE requiresZoneContext is true', () => {
    const result = getCtaDefinitionForPath('VIEW_BY_ZONE');
    expect(result).not.toBeNull();
    expect(result!.requiresZoneContext).toBe(true);
  });

  it('getCtaDefinitionForPath RELATED_DOCUMENTS_FROM_RECORD requiresRecordContext is true', () => {
    const result = getCtaDefinitionForPath('RELATED_DOCUMENTS_FROM_RECORD');
    expect(result).not.toBeNull();
    expect(result!.requiresRecordContext).toBe(true);
  });

  it('getCtaDefinitionForPath returns null for unknown path', () => {
    const result = getCtaDefinitionForPath('UNKNOWN' as never);
    expect(result).toBeNull();
  });

  // getEmptyStateForReason
  it('getEmptyStateForReason returns definition for NO_DOCUMENTS_IN_ZONE', () => {
    const result = getEmptyStateForReason('NO_DOCUMENTS_IN_ZONE');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('No Documents Yet');
  });

  it('getEmptyStateForReason returns null for unknown reason', () => {
    const result = getEmptyStateForReason('UNKNOWN' as never);
    expect(result).toBeNull();
  });

  // getNoAccessStateForReason
  it('getNoAccessStateForReason returns definition for PERMISSION_DENIED with contactAction', () => {
    const result = getNoAccessStateForReason('PERMISSION_DENIED');
    expect(result).not.toBeNull();
    expect(result!.contactAction).not.toBeNull();
  });

  it('getNoAccessStateForReason AUTH_REQUIRED has null contactAction', () => {
    const result = getNoAccessStateForReason('AUTH_REQUIRED');
    expect(result).not.toBeNull();
    expect(result!.contactAction).toBeNull();
  });

  it('getNoAccessStateForReason returns null for unknown reason', () => {
    const result = getNoAccessStateForReason('UNKNOWN' as never);
    expect(result).toBeNull();
  });

  // shouldShowCtaPaths
  it('shouldShowCtaPaths returns true for READY', () => {
    expect(shouldShowCtaPaths('READY')).toBe(true);
  });

  it('shouldShowCtaPaths returns false for EMPTY', () => {
    expect(shouldShowCtaPaths('EMPTY')).toBe(false);
  });

  it('shouldShowCtaPaths returns false for NO_ACCESS', () => {
    expect(shouldShowCtaPaths('NO_ACCESS')).toBe(false);
  });

  it('shouldShowCtaPaths returns false for LOADING', () => {
    expect(shouldShowCtaPaths('LOADING')).toBe(false);
  });

  it('shouldShowCtaPaths returns false for ERROR', () => {
    expect(shouldShowCtaPaths('ERROR')).toBe(false);
  });

  // shouldShowZoneNav
  it('shouldShowZoneNav returns true for READY', () => {
    expect(shouldShowZoneNav('READY')).toBe(true);
  });

  it('shouldShowZoneNav returns false for EMPTY', () => {
    expect(shouldShowZoneNav('EMPTY')).toBe(false);
  });

  it('shouldShowZoneNav returns false for NO_ACCESS', () => {
    expect(shouldShowZoneNav('NO_ACCESS')).toBe(false);
  });

  it('shouldShowZoneNav returns false for LOADING', () => {
    expect(shouldShowZoneNav('LOADING')).toBe(false);
  });

  it('shouldShowZoneNav returns false for ERROR', () => {
    expect(shouldShowZoneNav('ERROR')).toBe(false);
  });

  // isPreviewSupported
  it('isPreviewSupported returns true', () => {
    expect(isPreviewSupported()).toBe(true);
  });
});
