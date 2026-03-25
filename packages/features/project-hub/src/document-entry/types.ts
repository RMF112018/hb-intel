/**
 * P3-J1 E3 document-entry TypeScript contracts.
 * CTA definitions, entry states, empty/no-access states, composition.
 */

import type { DocumentRouteType } from '../document-launch/enums.js';
import type {
  DocumentCtaPath,
  DocumentEntryState,
  DocumentEmptyStateReason,
  DocumentNoAccessReason,
  DocumentCompositionSource,
} from './enums.js';

export interface IDocumentCtaDefinition {
  readonly ctaPath: DocumentCtaPath;
  readonly displayLabel: string;
  readonly description: string;
  readonly routeType: DocumentRouteType;
  readonly requiresZoneContext: boolean;
  readonly requiresRecordContext: boolean;
}

export interface IDocumentEntryStateConfig {
  readonly state: DocumentEntryState;
  readonly displayMessage: string;
  readonly showCtaPaths: boolean;
  readonly showZoneNav: boolean;
  readonly fallbackAction: string | null;
}

export interface IDocumentEmptyStateDef {
  readonly reason: DocumentEmptyStateReason;
  readonly title: string;
  readonly description: string;
  readonly suggestedAction: string;
}

export interface IDocumentNoAccessDef {
  readonly reason: DocumentNoAccessReason;
  readonly title: string;
  readonly description: string;
  readonly contactAction: string | null;
}

export interface IDocumentCompositionContract {
  readonly contractId: string;
  readonly source: DocumentCompositionSource;
  readonly componentPattern: string;
  readonly noFeatureLocalDuplication: boolean;
  readonly uiKitRequired: boolean;
}
