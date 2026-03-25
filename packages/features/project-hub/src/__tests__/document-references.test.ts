/**
 * P3-J1 E4 document-references contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  DOCUMENT_REFERENCE_TYPES,
  DOCUMENT_SOURCE_TYPES,
  DOCUMENT_AUTHORITY_STATES,
  DOCUMENT_AVAILABILITY_STATES,
  DOCUMENT_RENDERING_CONTEXTS,
  // Label maps
  DOCUMENT_REFERENCE_TYPE_LABELS,
  DOCUMENT_SOURCE_TYPE_LABELS,
  DOCUMENT_AUTHORITY_STATE_LABELS,
  DOCUMENT_AVAILABILITY_STATE_LABELS,
  DOCUMENT_RENDERING_CONTEXT_LABELS,
  // Contracts & constants
  DOCUMENT_RENDERING_RULES,
  DOCUMENT_PERMISSION_BOUNDARIES,
  RESTRICTED_STUB_REQUIRED_FIELDS,
  // Business rules
  canSurfaceDocumentInRelatedItems,
  preventsBroadPermissionLeakage,
  isCompatibleWithPhase5ConnectedRecordModel,
  isRestrictedStubSufficient,
  getDocumentRenderingRule,
  shouldShowAuthorityBadge,
  shouldShowAvailabilityIndicator,
  isDocumentRestricted,
  getPermissionBoundary,
  isRestrictedPlaceholderVisible,
  // Types (compile-time checks)
  type IDocumentRelatedItemRef,
  type IDocumentRestrictedStub,
  type IDocumentRenderingRule,
  type IDocumentZoneAssociation,
  type IDocumentPermissionBoundary,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-references contract stability', () => {
  it('DOCUMENT_REFERENCE_TYPES has 4 members', () => {
    expect(DOCUMENT_REFERENCE_TYPES).toHaveLength(4);
  });

  it('DOCUMENT_SOURCE_TYPES has 4 members', () => {
    expect(DOCUMENT_SOURCE_TYPES).toHaveLength(4);
  });

  it('DOCUMENT_AUTHORITY_STATES has 5 members', () => {
    expect(DOCUMENT_AUTHORITY_STATES).toHaveLength(5);
  });

  it('DOCUMENT_AVAILABILITY_STATES has 5 members', () => {
    expect(DOCUMENT_AVAILABILITY_STATES).toHaveLength(5);
  });

  it('DOCUMENT_RENDERING_CONTEXTS has 4 members', () => {
    expect(DOCUMENT_RENDERING_CONTEXTS).toHaveLength(4);
  });

  it('DOCUMENT_REFERENCE_TYPE_LABELS has 4 keys', () => {
    expect(Object.keys(DOCUMENT_REFERENCE_TYPE_LABELS)).toHaveLength(4);
  });

  it('DOCUMENT_SOURCE_TYPE_LABELS has 4 keys', () => {
    expect(Object.keys(DOCUMENT_SOURCE_TYPE_LABELS)).toHaveLength(4);
  });

  it('DOCUMENT_AUTHORITY_STATE_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_AUTHORITY_STATE_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_AVAILABILITY_STATE_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_AVAILABILITY_STATE_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_RENDERING_CONTEXT_LABELS has 4 keys', () => {
    expect(Object.keys(DOCUMENT_RENDERING_CONTEXT_LABELS)).toHaveLength(4);
  });

  it('DOCUMENT_RENDERING_RULES has 4 entries', () => {
    expect(DOCUMENT_RENDERING_RULES).toHaveLength(4);
  });

  it('DOCUMENT_PERMISSION_BOUNDARIES has 4 entries', () => {
    expect(DOCUMENT_PERMISSION_BOUNDARIES).toHaveLength(4);
  });

  it('all permission boundaries prevent broad permission leakage', () => {
    const allPrevent = DOCUMENT_PERMISSION_BOUNDARIES.every((b) => b.preventsBroadPermissionLeakage);
    expect(allPrevent).toBe(true);
  });

  it('RESTRICTED_STUB_REQUIRED_FIELDS has 6 entries', () => {
    expect(RESTRICTED_STUB_REQUIRED_FIELDS).toHaveLength(6);
  });

  it('PROJECT_HUB_PANEL rendering rule shows authority badge', () => {
    const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === 'PROJECT_HUB_PANEL');
    expect(rule?.showAuthorityBadge).toBe(true);
  });

  it('SEARCH_RESULT rendering rule does NOT show authority badge', () => {
    const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === 'SEARCH_RESULT');
    expect(rule?.showAuthorityBadge).toBe(false);
  });

  it('SEARCH_RESULT rendering rule does NOT allow direct navigation', () => {
    const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === 'SEARCH_RESULT');
    expect(rule?.allowDirectNavigation).toBe(false);
  });

  it('RELATED_ITEMS_LIST rendering rule shows availability indicator', () => {
    const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === 'RELATED_ITEMS_LIST');
    expect(rule?.showAvailabilityIndicator).toBe(true);
  });

  // Type-level compile checks (no runtime assertion needed)
  it('type contracts compile correctly', () => {
    const _relatedItemRef: IDocumentRelatedItemRef = {
      referenceId: 'ref-1',
      projectId: 'p1',
      sourceRecordId: 'rec-1',
      documentId: 'doc-1',
      referenceType: 'LINKED_PROJECT_RECORD',
      sourceType: 'SHAREPOINT_FILE',
      authorityState: 'CANONICAL',
      availabilityState: 'AVAILABLE',
      displayName: 'Test Document',
      description: null,
    };
    const _restrictedStub: IDocumentRestrictedStub = {
      stubId: 'stub-1',
      documentId: 'doc-1',
      referenceType: 'RESTRICTED_PLACEHOLDER',
      availabilityState: 'RESTRICTED',
      displayName: 'Restricted Document',
      restrictionReason: 'Insufficient permissions',
    };
    const _renderingRule: IDocumentRenderingRule = DOCUMENT_RENDERING_RULES[0]!;
    const _zoneAssociation: IDocumentZoneAssociation = {
      associationId: 'assoc-1',
      documentId: 'doc-1',
      zoneId: 'zone-submittals',
      referenceType: 'ZONE_ASSOCIATION',
      isPrimaryZone: true,
      description: 'Primary zone for document',
    };
    const _permissionBoundary: IDocumentPermissionBoundary = DOCUMENT_PERMISSION_BOUNDARIES[0]!;

    expect(_relatedItemRef).toBeDefined();
    expect(_restrictedStub).toBeDefined();
    expect(_renderingRule).toBeDefined();
    expect(_zoneAssociation).toBeDefined();
    expect(_permissionBoundary).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-references business rules', () => {
  describe('canSurfaceDocumentInRelatedItems', () => {
    it('returns true', () => {
      expect(canSurfaceDocumentInRelatedItems()).toBe(true);
    });
  });

  describe('preventsBroadPermissionLeakage', () => {
    it('returns true', () => {
      expect(preventsBroadPermissionLeakage()).toBe(true);
    });
  });

  describe('isCompatibleWithPhase5ConnectedRecordModel', () => {
    it('returns true', () => {
      expect(isCompatibleWithPhase5ConnectedRecordModel()).toBe(true);
    });
  });

  describe('isRestrictedStubSufficient', () => {
    it('returns true when all required fields are present', () => {
      const stub: IDocumentRestrictedStub = {
        stubId: 'stub-1',
        documentId: 'doc-1',
        referenceType: 'RESTRICTED_PLACEHOLDER',
        availabilityState: 'RESTRICTED',
        displayName: 'Restricted Document',
        restrictionReason: 'Insufficient permissions',
      };
      expect(isRestrictedStubSufficient(stub)).toBe(true);
    });

    it('returns false when stubId is missing', () => {
      expect(isRestrictedStubSufficient({
        documentId: 'doc-1',
        referenceType: 'RESTRICTED_PLACEHOLDER',
        availabilityState: 'RESTRICTED',
        displayName: 'Restricted Document',
        restrictionReason: 'Insufficient permissions',
      })).toBe(false);
    });

    it('returns false when displayName is empty string', () => {
      expect(isRestrictedStubSufficient({
        stubId: 'stub-1',
        documentId: 'doc-1',
        referenceType: 'RESTRICTED_PLACEHOLDER',
        availabilityState: 'RESTRICTED',
        displayName: '',
        restrictionReason: 'Insufficient permissions',
      })).toBe(false);
    });

    it('returns false when all fields are missing', () => {
      expect(isRestrictedStubSufficient({})).toBe(false);
    });
  });

  describe('getDocumentRenderingRule', () => {
    it('returns rule for PROJECT_HUB_PANEL', () => {
      const rule = getDocumentRenderingRule('PROJECT_HUB_PANEL');
      expect(rule).not.toBeNull();
      expect(rule?.renderingContext).toBe('PROJECT_HUB_PANEL');
    });

    it('returns rule for SEARCH_RESULT', () => {
      const rule = getDocumentRenderingRule('SEARCH_RESULT');
      expect(rule).not.toBeNull();
      expect(rule?.renderingContext).toBe('SEARCH_RESULT');
    });

    it('returns null for unknown context', () => {
      expect(getDocumentRenderingRule('UNKNOWN' as never)).toBeNull();
    });
  });

  describe('shouldShowAuthorityBadge', () => {
    it('returns true for PROJECT_HUB_PANEL', () => {
      expect(shouldShowAuthorityBadge('PROJECT_HUB_PANEL')).toBe(true);
    });

    it('returns true for MODULE_RECORD_SIDEBAR', () => {
      expect(shouldShowAuthorityBadge('MODULE_RECORD_SIDEBAR')).toBe(true);
    });

    it('returns false for RELATED_ITEMS_LIST', () => {
      expect(shouldShowAuthorityBadge('RELATED_ITEMS_LIST')).toBe(false);
    });

    it('returns false for SEARCH_RESULT', () => {
      expect(shouldShowAuthorityBadge('SEARCH_RESULT')).toBe(false);
    });
  });

  describe('shouldShowAvailabilityIndicator', () => {
    it('returns true for PROJECT_HUB_PANEL', () => {
      expect(shouldShowAvailabilityIndicator('PROJECT_HUB_PANEL')).toBe(true);
    });

    it('returns true for RELATED_ITEMS_LIST', () => {
      expect(shouldShowAvailabilityIndicator('RELATED_ITEMS_LIST')).toBe(true);
    });

    it('returns false for SEARCH_RESULT', () => {
      expect(shouldShowAvailabilityIndicator('SEARCH_RESULT')).toBe(false);
    });
  });

  describe('isDocumentRestricted', () => {
    it('returns true for RESTRICTED', () => {
      expect(isDocumentRestricted('RESTRICTED')).toBe(true);
    });

    it('returns true for NOT_AVAILABLE', () => {
      expect(isDocumentRestricted('NOT_AVAILABLE')).toBe(true);
    });

    it('returns true for PENDING_ACCESS', () => {
      expect(isDocumentRestricted('PENDING_ACCESS')).toBe(true);
    });

    it('returns false for AVAILABLE', () => {
      expect(isDocumentRestricted('AVAILABLE')).toBe(false);
    });

    it('returns false for PREVIEW_ONLY', () => {
      expect(isDocumentRestricted('PREVIEW_ONLY')).toBe(false);
    });
  });

  describe('getPermissionBoundary', () => {
    it('returns boundary for PROJECT_HUB_PANEL', () => {
      const boundary = getPermissionBoundary('PROJECT_HUB_PANEL');
      expect(boundary).not.toBeNull();
      expect(boundary?.renderingContext).toBe('PROJECT_HUB_PANEL');
      expect(boundary?.preventsBroadPermissionLeakage).toBe(true);
    });

    it('returns boundary for SEARCH_RESULT', () => {
      const boundary = getPermissionBoundary('SEARCH_RESULT');
      expect(boundary).not.toBeNull();
      expect(boundary?.preventsBroadPermissionLeakage).toBe(true);
    });

    it('returns null for unknown context', () => {
      expect(getPermissionBoundary('UNKNOWN' as never)).toBeNull();
    });
  });

  describe('isRestrictedPlaceholderVisible', () => {
    it('returns true', () => {
      expect(isRestrictedPlaceholderVisible()).toBe(true);
    });
  });
});
