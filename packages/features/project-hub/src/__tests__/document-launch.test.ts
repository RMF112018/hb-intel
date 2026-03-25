/**
 * P3-J1 E1 document-launch contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  DOCUMENT_ROUTE_TYPES,
  LAUNCH_CONTEXT_SOURCES,
  DOCUMENT_DEEP_LINK_RESOLUTIONS,
  APPLICATION_LANES_FOR_DOCUMENTS,
  DOCUMENT_ROUTE_OWNERSHIPS,
  // Label maps
  DOCUMENT_ROUTE_TYPE_LABELS,
  DOCUMENT_DEEP_LINK_RESOLUTION_LABELS,
  DOCUMENT_ROUTE_OWNERSHIP_LABELS,
  // Contracts & constants
  DOCUMENT_ROUTE_CONTRACTS,
  DOCUMENT_REDIRECT_RULES,
  DOCUMENT_LANE_BEHAVIORS,
  LAUNCH_STATE_REQUIRED_FIELDS,
  // Business rules
  isProjectContextRequired,
  doesRouteUseRawSharePointUrl,
  isRawSharePointUrlPrimaryContract,
  canFutureShellMountWithoutRouteChange,
  getRouteContractForType,
  resolveDocumentDeepLink,
  buildDocumentLaunchState,
  isLaunchStateValid,
  isDocumentRouteProjectHubOwned,
  isGlobalDocumentsScopePhase3,
  supportsDeepLinkInLane,
  // Types (compile-time checks)
  type IDocumentLaunchState,
  type IDocumentRouteContract,
  type IDocumentRedirectRule,
  type IDocumentDeepLinkResult,
  type IDocumentLaneBehavior,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-launch contract stability', () => {
  it('DOCUMENT_ROUTE_TYPES has 5 members', () => {
    expect(DOCUMENT_ROUTE_TYPES).toHaveLength(5);
  });

  it('LAUNCH_CONTEXT_SOURCES has 6 members', () => {
    expect(LAUNCH_CONTEXT_SOURCES).toHaveLength(6);
  });

  it('DOCUMENT_DEEP_LINK_RESOLUTIONS has 5 members', () => {
    expect(DOCUMENT_DEEP_LINK_RESOLUTIONS).toHaveLength(5);
  });

  it('APPLICATION_LANES_FOR_DOCUMENTS has 2 members', () => {
    expect(APPLICATION_LANES_FOR_DOCUMENTS).toHaveLength(2);
  });

  it('DOCUMENT_ROUTE_OWNERSHIPS has 3 members', () => {
    expect(DOCUMENT_ROUTE_OWNERSHIPS).toHaveLength(3);
  });

  it('DOCUMENT_ROUTE_TYPE_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_ROUTE_TYPE_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_DEEP_LINK_RESOLUTION_LABELS has 5 keys', () => {
    expect(Object.keys(DOCUMENT_DEEP_LINK_RESOLUTION_LABELS)).toHaveLength(5);
  });

  it('DOCUMENT_ROUTE_OWNERSHIP_LABELS has 3 keys', () => {
    expect(Object.keys(DOCUMENT_ROUTE_OWNERSHIP_LABELS)).toHaveLength(3);
  });

  it('DOCUMENT_ROUTE_CONTRACTS has 5 entries', () => {
    expect(DOCUMENT_ROUTE_CONTRACTS).toHaveLength(5);
  });

  it('DOCUMENT_REDIRECT_RULES has 3 entries', () => {
    expect(DOCUMENT_REDIRECT_RULES).toHaveLength(3);
  });

  it('DOCUMENT_LANE_BEHAVIORS has 2 entries', () => {
    expect(DOCUMENT_LANE_BEHAVIORS).toHaveLength(2);
  });

  it('LAUNCH_STATE_REQUIRED_FIELDS has 3 entries', () => {
    expect(LAUNCH_STATE_REQUIRED_FIELDS).toHaveLength(3);
  });

  it('4 of 5 routes require project context', () => {
    const contextRequired = DOCUMENT_ROUTE_CONTRACTS.filter((c) => c.requiresProjectContext);
    expect(contextRequired).toHaveLength(4);
  });

  it('GLOBAL_DOCUMENTS_ESCAPE does NOT require project context', () => {
    const escape = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === 'GLOBAL_DOCUMENTS_ESCAPE');
    expect(escape?.requiresProjectContext).toBe(false);
  });

  it('DIRECT_DOCUMENT_DEEP_LINK supports deep links', () => {
    const deepLink = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === 'DIRECT_DOCUMENT_DEEP_LINK');
    expect(deepLink?.supportsDeepLink).toBe(true);
  });

  it('RAW_LIBRARY_FALLBACK does NOT support deep links', () => {
    const fallback = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === 'RAW_LIBRARY_FALLBACK');
    expect(fallback?.supportsDeepLink).toBe(false);
  });

  it('GLOBAL_DOCUMENTS_ESCAPE ownership is SHARED_SHELL_FUTURE', () => {
    const escape = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === 'GLOBAL_DOCUMENTS_ESCAPE');
    expect(escape?.ownership).toBe('SHARED_SHELL_FUTURE');
  });

  // Type-level compile checks (no runtime assertion needed)
  it('type contracts compile correctly', () => {
    const _launchState: IDocumentLaunchState = {
      launchStateId: 'test',
      projectId: 'p1',
      workspaceId: null,
      zoneId: null,
      sourceRoute: '/test',
      relatedRecordContext: null,
      searchScopeDefault: null,
      routeType: 'PROJECT_SCOPED_LANDING',
    };
    const _routeContract: IDocumentRouteContract = DOCUMENT_ROUTE_CONTRACTS[0]!;
    const _redirectRule: IDocumentRedirectRule = DOCUMENT_REDIRECT_RULES[0]!;
    const _deepLinkResult: IDocumentDeepLinkResult = {
      resolution: 'RESOLVED_TO_DOCUMENT',
      resolvedUrl: '/test',
      projectId: 'p1',
      documentId: 'doc-1',
      fallbackLibraryUrl: null,
    };
    const _laneBehavior: IDocumentLaneBehavior = DOCUMENT_LANE_BEHAVIORS[0]!;

    expect(_launchState).toBeDefined();
    expect(_routeContract).toBeDefined();
    expect(_redirectRule).toBeDefined();
    expect(_deepLinkResult).toBeDefined();
    expect(_laneBehavior).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-launch business rules', () => {
  describe('isProjectContextRequired', () => {
    it('returns true for PROJECT_SCOPED_LANDING', () => {
      expect(isProjectContextRequired('PROJECT_SCOPED_LANDING')).toBe(true);
    });

    it('returns false for GLOBAL_DOCUMENTS_ESCAPE', () => {
      expect(isProjectContextRequired('GLOBAL_DOCUMENTS_ESCAPE')).toBe(false);
    });

    it('returns true for DIRECT_DOCUMENT_DEEP_LINK', () => {
      expect(isProjectContextRequired('DIRECT_DOCUMENT_DEEP_LINK')).toBe(true);
    });
  });

  describe('doesRouteUseRawSharePointUrl', () => {
    it('returns true for RAW_LIBRARY_FALLBACK', () => {
      expect(doesRouteUseRawSharePointUrl('RAW_LIBRARY_FALLBACK')).toBe(true);
    });

    it('returns false for PROJECT_SCOPED_LANDING', () => {
      expect(doesRouteUseRawSharePointUrl('PROJECT_SCOPED_LANDING')).toBe(false);
    });
  });

  describe('isRawSharePointUrlPrimaryContract', () => {
    it('returns false', () => {
      expect(isRawSharePointUrlPrimaryContract()).toBe(false);
    });
  });

  describe('canFutureShellMountWithoutRouteChange', () => {
    it('returns true', () => {
      expect(canFutureShellMountWithoutRouteChange()).toBe(true);
    });
  });

  describe('getRouteContractForType', () => {
    it('returns contract for PROJECT_SCOPED_LANDING', () => {
      const contract = getRouteContractForType('PROJECT_SCOPED_LANDING');
      expect(contract).not.toBeNull();
      expect(contract?.routeType).toBe('PROJECT_SCOPED_LANDING');
    });

    it('returns null for unknown type', () => {
      expect(getRouteContractForType('UNKNOWN' as never)).toBeNull();
    });
  });

  describe('resolveDocumentDeepLink', () => {
    it('returns RESOLVED_TO_DOCUMENT for valid projectId and documentId', () => {
      expect(resolveDocumentDeepLink('proj-1', 'doc-1')).toBe('RESOLVED_TO_DOCUMENT');
    });

    it('returns FALLBACK_TO_LIBRARY when documentId is null', () => {
      expect(resolveDocumentDeepLink('proj-1', null)).toBe('FALLBACK_TO_LIBRARY');
    });

    it('returns PERMISSION_DENIED when projectId is empty', () => {
      expect(resolveDocumentDeepLink('', 'doc-1')).toBe('PERMISSION_DENIED');
    });
  });

  describe('buildDocumentLaunchState', () => {
    it('returns valid state with correct fields', () => {
      const state = buildDocumentLaunchState('proj-1', '/documents', 'PROJECT_SCOPED_LANDING');
      expect(state.projectId).toBe('proj-1');
      expect(state.sourceRoute).toBe('/documents');
      expect(state.routeType).toBe('PROJECT_SCOPED_LANDING');
      expect(state.launchStateId).toMatch(/^launch-/);
      expect(state.workspaceId).toBeNull();
      expect(state.zoneId).toBeNull();
      expect(state.relatedRecordContext).toBeNull();
      expect(state.searchScopeDefault).toBeNull();
    });
  });

  describe('isLaunchStateValid', () => {
    it('returns true for valid state', () => {
      const state = buildDocumentLaunchState('proj-1', '/documents', 'PROJECT_SCOPED_LANDING');
      expect(isLaunchStateValid(state)).toBe(true);
    });

    it('returns false when projectId is empty', () => {
      const state = buildDocumentLaunchState('', '/documents', 'PROJECT_SCOPED_LANDING');
      expect(isLaunchStateValid(state)).toBe(false);
    });

    it('returns false when sourceRoute is empty', () => {
      const state = buildDocumentLaunchState('proj-1', '', 'PROJECT_SCOPED_LANDING');
      expect(isLaunchStateValid(state)).toBe(false);
    });
  });

  describe('isDocumentRouteProjectHubOwned', () => {
    it('returns true for PROJECT_SCOPED_LANDING', () => {
      expect(isDocumentRouteProjectHubOwned('PROJECT_SCOPED_LANDING')).toBe(true);
    });

    it('returns false for GLOBAL_DOCUMENTS_ESCAPE', () => {
      expect(isDocumentRouteProjectHubOwned('GLOBAL_DOCUMENTS_ESCAPE')).toBe(false);
    });
  });

  describe('isGlobalDocumentsScopePhase3', () => {
    it('returns false', () => {
      expect(isGlobalDocumentsScopePhase3()).toBe(false);
    });
  });

  describe('supportsDeepLinkInLane', () => {
    it('returns true for PWA', () => {
      expect(supportsDeepLinkInLane('PWA')).toBe(true);
    });

    it('returns false for SPFX', () => {
      expect(supportsDeepLinkInLane('SPFX')).toBe(false);
    });
  });
});
