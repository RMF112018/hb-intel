/**
 * P3-J1 E1 document-launch TypeScript contracts.
 * Launch state, route contracts, redirect rules, deep-link results, lane behaviors.
 */

import type {
  ApplicationLaneForDocuments,
  DocumentDeepLinkResolution,
  DocumentRouteOwnership,
  DocumentRouteType,
} from './enums.js';

export interface IDocumentLaunchState {
  readonly launchStateId: string;
  readonly projectId: string;
  readonly workspaceId: string | null;
  readonly zoneId: string | null;
  readonly sourceRoute: string;
  readonly relatedRecordContext: string | null;
  readonly searchScopeDefault: string | null;
  readonly routeType: DocumentRouteType;
}

export interface IDocumentRouteContract {
  readonly routeType: DocumentRouteType;
  readonly routePattern: string;
  readonly description: string;
  readonly requiresProjectContext: boolean;
  readonly supportsDeepLink: boolean;
  readonly ownership: DocumentRouteOwnership;
}

export interface IDocumentRedirectRule {
  readonly ruleId: string;
  readonly fromPattern: string;
  readonly toRouteType: DocumentRouteType;
  readonly preservesContext: boolean;
  readonly description: string;
}

export interface IDocumentDeepLinkResult {
  readonly resolution: DocumentDeepLinkResolution;
  readonly resolvedUrl: string | null;
  readonly projectId: string;
  readonly documentId: string | null;
  readonly fallbackLibraryUrl: string | null;
}

export interface IDocumentLaneBehavior {
  readonly lane: ApplicationLaneForDocuments;
  readonly supportsProjectScopedLanding: boolean;
  readonly supportsDirectDeepLink: boolean;
  readonly fallbackBehavior: string;
}
