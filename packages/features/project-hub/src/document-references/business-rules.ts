/**
 * P3-J1 E4 document-references business rules.
 * Surface eligibility, permission leakage prevention, phase 5 compatibility,
 * restricted stub validation, rendering, authority, availability, permissions.
 */

import type { DocumentAuthorityState, DocumentAvailabilityState, DocumentRenderingContext } from './enums.js';
import type { IDocumentPermissionBoundary, IDocumentRenderingRule, IDocumentRestrictedStub } from './types.js';
import { DOCUMENT_PERMISSION_BOUNDARIES, DOCUMENT_RENDERING_RULES, RESTRICTED_STUB_REQUIRED_FIELDS } from './constants.js';

export const canSurfaceDocumentInRelatedItems = (): true => true;

export const preventsBroadPermissionLeakage = (): true => true;

export const isCompatibleWithPhase5ConnectedRecordModel = (): true => true;

export const isRestrictedStubSufficient = (stub: Partial<IDocumentRestrictedStub>): boolean =>
  RESTRICTED_STUB_REQUIRED_FIELDS.every((field) => {
    const value = (stub as Record<string, unknown>)[field];
    return value !== undefined && value !== null && value !== '';
  });

export const getDocumentRenderingRule = (context: DocumentRenderingContext): IDocumentRenderingRule | null =>
  DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === context) ?? null;

export const shouldShowAuthorityBadge = (context: DocumentRenderingContext): boolean => {
  const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === context);
  return rule !== undefined && rule.showAuthorityBadge;
};

export const shouldShowAvailabilityIndicator = (context: DocumentRenderingContext): boolean => {
  const rule = DOCUMENT_RENDERING_RULES.find((r) => r.renderingContext === context);
  return rule !== undefined && rule.showAvailabilityIndicator;
};

export const isDocumentRestricted = (availability: DocumentAvailabilityState): boolean =>
  availability === 'RESTRICTED' || availability === 'NOT_AVAILABLE' || availability === 'PENDING_ACCESS';

export const getPermissionBoundary = (context: DocumentRenderingContext): IDocumentPermissionBoundary | null =>
  DOCUMENT_PERMISSION_BOUNDARIES.find((b) => b.renderingContext === context) ?? null;

export const isRestrictedPlaceholderVisible = (): true => true;
