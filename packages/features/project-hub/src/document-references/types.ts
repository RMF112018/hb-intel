/**
 * P3-J1 E4 document-references TypeScript contracts.
 * Related-item refs, restricted stubs, rendering rules, zone associations, permission boundaries.
 */

import type {
  DocumentAuthorityState,
  DocumentAvailabilityState,
  DocumentReferenceType,
  DocumentRenderingContext,
  DocumentSourceType,
} from './enums.js';

export interface IDocumentRelatedItemRef {
  readonly referenceId: string;
  readonly projectId: string;
  readonly sourceRecordId: string;
  readonly documentId: string;
  readonly referenceType: DocumentReferenceType;
  readonly sourceType: DocumentSourceType;
  readonly authorityState: DocumentAuthorityState;
  readonly availabilityState: DocumentAvailabilityState;
  readonly displayName: string;
  readonly description: string | null;
}

export interface IDocumentRestrictedStub {
  readonly stubId: string;
  readonly documentId: string;
  readonly referenceType: DocumentReferenceType;
  readonly availabilityState: DocumentAvailabilityState;
  readonly displayName: string;
  readonly restrictionReason: string;
}

export interface IDocumentRenderingRule {
  readonly ruleId: string;
  readonly renderingContext: DocumentRenderingContext;
  readonly showAuthorityBadge: boolean;
  readonly showAvailabilityIndicator: boolean;
  readonly allowDirectNavigation: boolean;
  readonly description: string;
}

export interface IDocumentZoneAssociation {
  readonly associationId: string;
  readonly documentId: string;
  readonly zoneId: string;
  readonly referenceType: DocumentReferenceType;
  readonly isPrimaryZone: boolean;
  readonly description: string;
}

export interface IDocumentPermissionBoundary {
  readonly boundaryId: string;
  readonly renderingContext: DocumentRenderingContext;
  readonly preventsBroadPermissionLeakage: boolean;
  readonly requiresExplicitGrant: boolean;
  readonly description: string;
}
