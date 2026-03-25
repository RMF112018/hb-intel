/**
 * P3-J1 E1 document-launch business rules.
 * Route resolution, launch-state validation, guardrail enforcement.
 */

import type { ApplicationLaneForDocuments, DocumentDeepLinkResolution, DocumentRouteType } from './enums.js';
import type { IDocumentLaunchState, IDocumentRedirectRule, IDocumentRouteContract } from './types.js';
import { DOCUMENT_LANE_BEHAVIORS, DOCUMENT_REDIRECT_RULES, DOCUMENT_ROUTE_CONTRACTS } from './constants.js';

export const isProjectContextRequired = (routeType: DocumentRouteType): boolean => {
  const contract = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === routeType);
  return contract !== undefined && contract.requiresProjectContext;
};

export const doesRouteUseRawSharePointUrl = (routeType: DocumentRouteType): boolean =>
  routeType === 'RAW_LIBRARY_FALLBACK';

export const isRawSharePointUrlPrimaryContract = (): false => false;

export const canFutureShellMountWithoutRouteChange = (): true => true;

export const getRouteContractForType = (routeType: DocumentRouteType): IDocumentRouteContract | null =>
  DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === routeType) ?? null;

export const resolveDocumentDeepLink = (
  projectId: string,
  documentId: string | null,
): DocumentDeepLinkResolution => {
  if (!projectId) return 'PERMISSION_DENIED';
  if (!documentId) return 'FALLBACK_TO_LIBRARY';
  return 'RESOLVED_TO_DOCUMENT';
};

export const buildDocumentLaunchState = (
  projectId: string,
  sourceRoute: string,
  routeType: DocumentRouteType,
): IDocumentLaunchState => ({
  launchStateId: `launch-${Date.now()}`,
  projectId,
  workspaceId: null,
  zoneId: null,
  sourceRoute,
  relatedRecordContext: null,
  searchScopeDefault: null,
  routeType,
});

export const isLaunchStateValid = (state: IDocumentLaunchState): boolean =>
  state.projectId !== '' && state.sourceRoute !== '' && state.routeType !== undefined;

export const getRedirectRuleForPattern = (pattern: string): IDocumentRedirectRule | null =>
  DOCUMENT_REDIRECT_RULES.find((r) => pattern.includes(r.ruleId.split('-')[0] ?? '')) ?? null;

export const isDocumentRouteProjectHubOwned = (routeType: DocumentRouteType): boolean => {
  const contract = DOCUMENT_ROUTE_CONTRACTS.find((c) => c.routeType === routeType);
  return contract !== undefined && contract.ownership === 'PROJECT_HUB_OWNED';
};

export const isGlobalDocumentsScopePhase3 = (): false => false;

export const supportsDeepLinkInLane = (lane: ApplicationLaneForDocuments): boolean => {
  const behavior = DOCUMENT_LANE_BEHAVIORS.find((b) => b.lane === lane);
  return behavior !== undefined && behavior.supportsDirectDeepLink;
};
